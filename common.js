/* common.js — shared by the content script, popup and options page. */

"use strict";

// Assigned to globalThis (not declared with const) so the file can be
// injected into the same page more than once without a redeclaration error.
globalThis.AutoTagMateCommon = (() => {
    const DEFAULTS = Object.freeze({
        enabled: true,
        activationKey: "Tab",
        autoCloseTag: true,
        excludedSites: ""
    });

    const MODIFIERS = ["Ctrl", "Alt", "Shift", "Meta"];

    // Keys that must never become the activation key: they would break typing.
    const FORBIDDEN_KEYS = ["Backspace", "Delete", "Enter", "Escape", " ", "Spacebar"];

    /**
     * Splits the stored list of excluded sites (one per line or comma-separated)
     * into normalized hostnames: "https://www.Site.com/path" -> "www.site.com".
     * @param {string} value
     * @returns {string[]}
     */
    function parseSites(value) {
        return String(value || "")
            .split(/[\s,]+/)
            .map((s) => s.trim().toLowerCase()
                .replace(/^[a-z][a-z0-9+.-]*:\/\//, "")
                .replace(/[/?#].*$/, "")
                .replace(/:\d+$/, "")
                .replace(/^\*\./, "")
                .replace(/\.$/, ""))
            .filter(Boolean);
    }

    /**
     * true if the host equals one of the sites or is a subdomain of it.
     * @param {string} host
     * @param {string[]} sites
     */
    function isHostExcluded(host, sites) {
        host = String(host || "").toLowerCase();
        if (!host) return false;
        return sites.some((site) => host === site || host.endsWith("." + site));
    }

    /**
     * Parses a stored combination like "Ctrl+Shift+K" or "Ctrl++".
     * @param {string} combo
     * @returns {{ctrl:boolean, alt:boolean, shift:boolean, meta:boolean, key:string}|null}
     */
    function parseCombo(combo) {
        combo = String(combo || "");
        let key = "";
        let modsPart = combo;
        if (combo === "+" || combo.endsWith("++")) {
            key = "+";
            modsPart = combo.slice(0, -1);
        }
        const parts = modsPart.split("+").filter(Boolean);
        if (!key) key = parts.filter((p) => !MODIFIERS.includes(p)).pop() || "";
        if (!key) return null;
        return {
            ctrl: parts.includes("Ctrl"),
            alt: parts.includes("Alt"),
            shift: parts.includes("Shift"),
            meta: parts.includes("Meta"),
            key
        };
    }

    /**
     * Builds a combination string from a keyboard event. Letters and digits are
     * taken from e.code so the shortcut does not depend on the keyboard layout.
     * @param {KeyboardEvent} e
     * @returns {{combo:string, complete:boolean, forbidden:boolean}}
     */
    function comboFromEvent(e) {
        const keys = [];
        if (e.ctrlKey) keys.push("Ctrl");
        if (e.altKey) keys.push("Alt");
        if (e.shiftKey) keys.push("Shift");
        if (e.metaKey) keys.push("Meta");

        let key = e.key;
        const isModifier = ["Control", "Shift", "Alt", "Meta", "AltGraph", "OS"].includes(key);
        if (!isModifier) {
            if (/^Key[A-Z]$/.test(e.code)) key = e.code.slice(3);
            else if (/^Digit\d$/.test(e.code)) key = e.code.slice(5);
            else if (key.length === 1) key = key.toUpperCase();
            keys.push(key);
        }
        const hasModifier = e.ctrlKey || e.altKey || e.metaKey;
        return {
            combo: keys.join("+"),
            complete: !isModifier,
            // A lone printable character (without Ctrl/Alt/Meta) would stop that
            // character from being typed, so it is not allowed either.
            forbidden: !isModifier && (FORBIDDEN_KEYS.includes(e.key) ||
                (!hasModifier && e.key.length === 1))
        };
    }

    /**
     * Checks whether a keyboard event matches a parsed combination.
     * @param {KeyboardEvent} e
     * @param {ReturnType<typeof parseCombo>} combo
     */
    function matchesCombo(e, combo) {
        if (!combo) return false;
        if (e.ctrlKey !== combo.ctrl || e.altKey !== combo.alt ||
            e.shiftKey !== combo.shift || e.metaKey !== combo.meta) return false;
        const key = combo.key;
        if (e.key.toLowerCase() === key.toLowerCase()) return true;
        if (/^[A-Z]$/i.test(key) && e.code === "Key" + key.toUpperCase()) return true;
        if (/^\d$/.test(key) && e.code === "Digit" + key) return true;
        return false;
    }

    return { DEFAULTS, parseSites, isHostExcluded, parseCombo, comboFromEvent, matchesCombo };
})();
