/* content_script.js */

/**
 * AutoTagMate Content Script
 * -------------------------------------------
 * - This script does NOT collect or send user data anywhere.
 * - All logic runs locally in the browser.
 *
 * Text is changed through document.execCommand("insertText"): unlike writing
 * to el.value / textContent directly, it goes through the browser's editing
 * pipeline, so React/ProseMirror/Lexical editors (ChatGPT, Claude, Gmail…)
 * see the change and Ctrl+Z undoes it.
 */
(() => {
    "use strict";

    const { DEFAULTS, parseSites, isHostExcluded, parseCombo, matchesCombo } =
        globalThis.AutoTagMateCommon;

    // The script may be injected again into an already open tab after the
    // extension is updated. Tell the previous copy to remove its listeners.
    const TEARDOWN_EVENT = "autotagmate:teardown";
    document.dispatchEvent(new CustomEvent(TEARDOWN_EVENT));

    /* ============================================
       1. Settings
       ============================================ */

    let settings = { ...DEFAULTS };
    let combo = parseCombo(DEFAULTS.activationKey);
    let excluded = false;

    // Inside an iframe (e.g. an editor frame) the excluded-sites list should
    // still apply to the site the user sees in the address bar.
    function pageHost() {
        const origins = location.ancestorOrigins;
        if (origins && origins.length) {
            try {
                return new URL(origins[origins.length - 1]).hostname;
            } catch (_) { /* fall through */ }
        }
        return location.hostname;
    }

    function applySettings(items) {
        settings = { ...DEFAULTS, ...items };
        combo = parseCombo(settings.activationKey) || parseCombo(DEFAULTS.activationKey);
        excluded = isHostExcluded(pageHost(), parseSites(settings.excludedSites));
    }

    function isActive() {
        return settings.enabled && !excluded;
    }

    function onStorageChanged(changes, area) {
        if (area !== "sync") return;
        const next = { ...settings };
        for (const [key, change] of Object.entries(changes)) {
            if (key in DEFAULTS) next[key] = change.newValue ?? DEFAULTS[key];
        }
        applySettings(next);
    }

    chrome.storage.sync.get(DEFAULTS, applySettings);
    chrome.storage.onChanged.addListener(onStorageChanged);

    /* ============================================
       2. Editable elements
       ============================================ */

    // Input types that support selectionStart/setSelectionRange.
    const TEXT_INPUT_TYPES = ["text", "search", "url", "tel", ""];

    function isTextControl(el) {
        if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled;
        if (el instanceof HTMLInputElement) {
            return TEXT_INPUT_TYPES.includes(el.type) && !el.readOnly && !el.disabled;
        }
        return false;
    }

    /**
     * Returns the real target of the event (looking inside Shadow DOM) if it
     * can be edited, otherwise null.
     */
    function getEditableTarget(e) {
        const path = e.composedPath ? e.composedPath() : [];
        const el = path[0] || e.target;
        if (!(el instanceof Element)) return null;
        if (el.closest('[data-autotagmate="off"]')) return null;
        if (isTextControl(el) || el.isContentEditable) return el;
        return null;
    }

    /* ============================================
       3. Text replacement helpers
       ============================================ */

    /**
     * Replaces [start, end) of an input/textarea and puts the caret at caretPos.
     */
    function replaceInTextControl(el, start, end, text, caretPos) {
        el.focus();
        el.setSelectionRange(start, end);
        let inserted = false;
        try {
            inserted = document.execCommand("insertText", false, text);
        } catch (_) { /* fall back below */ }
        if (!inserted) {
            el.setRangeText(text, start, end, "end");
            el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
        }
        el.setSelectionRange(caretPos, caretPos);
    }

    /**
     * Replaces a range inside a contenteditable element and moves the caret
     * caretFromEnd characters back from the end of the inserted text.
     */
    function replaceInContentEditable(range, text, caretFromEnd) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        let inserted = false;
        try {
            inserted = document.execCommand("insertText", false, text);
        } catch (_) { /* fall back below */ }
        if (!inserted) {
            range.deleteContents();
            const node = document.createTextNode(text);
            range.insertNode(node);
            sel.collapse(node, node.length);
        }
        moveCaretBack(sel, caretFromEnd);
    }

    function moveCaretBack(sel, count) {
        if (!count) return;
        const node = sel.focusNode;
        if (node && node.nodeType === Node.TEXT_NODE && sel.focusOffset >= count) {
            sel.collapse(node, sel.focusOffset - count);
            return;
        }
        for (let i = 0; i < count; i++) sel.modify("move", "backward", "character");
    }

    /**
     * Returns the text node and offset of a collapsed caret in contenteditable.
     */
    function caretTextPosition() {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        const range = sel.getRangeAt(0);
        let node = range.startContainer;
        let offset = range.startOffset;
        if (node.nodeType !== Node.TEXT_NODE) {
            const prev = node.childNodes[offset - 1];
            if (!prev || prev.nodeType !== Node.TEXT_NODE) return null;
            node = prev;
            offset = prev.length;
        }
        return { node, offset };
    }

    /* ============================================
       4. Tag wrapping
       ============================================ */

    // Last word before the caret. "<" and ">" are excluded so that pressing the
    // key right after an existing tag does not wrap the tag itself.
    const WORD_BEFORE_CARET = /([^\s<>]+)$/u;

    function makeTags(name) {
        return { open: `<${name}>`, close: `</${name}>` };
    }

    /**
     * Splits a selection into leading whitespace, tag name and trailing
     * whitespace, so that "  foo " becomes "  <foo></foo> ".
     */
    function splitSelection(text) {
        const m = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
        const name = m[2].replace(/\s+/g, " ");
        return { lead: m[1], name, trail: m[3] };
    }

    /** Wraps the selection or the word before the caret. Returns true on success. */
    function wrap(el) {
        return isTextControl(el) ? wrapInTextControl(el) : wrapInContentEditable();
    }

    function wrapInTextControl(el) {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        if (start == null) return false;

        if (start !== end) {
            const { lead, name, trail } = splitSelection(el.value.slice(start, end));
            if (!name) return false;
            const { open, close } = makeTags(name);
            replaceInTextControl(el, start, end, lead + open + close + trail, start + lead.length + open.length);
            return true;
        }

        const match = el.value.slice(0, start).match(WORD_BEFORE_CARET);
        if (!match) return false;
        const wordStart = start - match[1].length;
        const { open, close } = makeTags(match[1]);
        replaceInTextControl(el, wordStart, start, open + close, wordStart + open.length);
        return true;
    }

    function wrapInContentEditable() {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return false;

        if (!sel.isCollapsed) {
            const { lead, name, trail } = splitSelection(sel.toString());
            if (!name) return false;
            const { open, close } = makeTags(name);
            replaceInContentEditable(sel.getRangeAt(0), lead + open + close + trail, close.length + trail.length);
            return true;
        }

        const pos = caretTextPosition();
        if (!pos) return false;
        const match = pos.node.data.slice(0, pos.offset).match(WORD_BEFORE_CARET);
        if (!match) return false;
        const range = document.createRange();
        range.setStart(pos.node, pos.offset - match[1].length);
        range.setEnd(pos.node, pos.offset);
        const { open, close } = makeTags(match[1]);
        replaceInContentEditable(range, open + close, close.length);
        return true;
    }

    /* ============================================
       5. Auto-closing tags
       ============================================ */

    // "<name>" right before the caret. The name starts with a letter/digit/_,
    // may contain spaces, dots, colons and dashes, and does not end with a
    // space, so "a < b > c" is not treated as a tag.
    const OPEN_TAG_BEFORE_CARET = /<([\p{L}\p{N}_](?:[\p{L}\p{N}_ .:-]*[\p{L}\p{N}_.-])?)>$/u;

    function autoClose(el) {
        if (isTextControl(el)) {
            const pos = el.selectionStart;
            if (pos == null || pos !== el.selectionEnd) return;
            const m = el.value.slice(0, pos).match(OPEN_TAG_BEFORE_CARET);
            if (!m) return;
            const close = `</${m[1]}>`;
            if (el.value.startsWith(close, pos)) return;
            replaceInTextControl(el, pos, pos, close, pos);
            return;
        }

        const sel = window.getSelection();
        if (!sel || !sel.isCollapsed) return;
        const pos = caretTextPosition();
        if (!pos) return;
        const m = pos.node.data.slice(0, pos.offset).match(OPEN_TAG_BEFORE_CARET);
        if (!m) return;
        const close = `</${m[1]}>`;
        if (pos.node.data.startsWith(close, pos.offset)) return;
        const range = document.createRange();
        range.setStart(pos.node, pos.offset);
        range.collapse(true);
        replaceInContentEditable(range, close, close.length);
    }

    /* ============================================
       6. Event handlers
       ============================================ */

    // After the extension is reloaded the old copy of this script loses access
    // to chrome.* APIs; it must stop reacting to events.
    function contextAlive() {
        if (chrome.runtime && chrome.runtime.id) return true;
        teardown();
        return false;
    }

    function onKeydown(e) {
        if (e.isComposing || e.defaultPrevented || !isActive() || !matchesCombo(e, combo)) return;
        const el = getEditableTarget(e);
        if (!el || !contextAlive()) return;
        // Only swallow the key if something was actually wrapped: otherwise Tab
        // keeps moving focus between fields as usual.
        if (wrap(el)) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    function onInput(e) {
        if (!settings.autoCloseTag || !isActive()) return;
        if (e.inputType !== "insertText" || e.data !== ">") return;
        const el = getEditableTarget(e);
        if (!el || !contextAlive()) return;
        // Let the editor finish processing the typed ">" first.
        setTimeout(() => autoClose(el), 0);
    }

    function teardown() {
        document.removeEventListener("keydown", onKeydown, true);
        document.removeEventListener("input", onInput, true);
        document.removeEventListener(TEARDOWN_EVENT, teardown);
        try {
            chrome.storage.onChanged.removeListener(onStorageChanged);
        } catch (_) { /* context already invalidated */ }
    }

    // Capture phase: the page's own handlers (e.g. an editor that uses Tab for
    // indentation) must not get the key before us when we wrap a word.
    document.addEventListener("keydown", onKeydown, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener(TEARDOWN_EVENT, teardown);
})();
