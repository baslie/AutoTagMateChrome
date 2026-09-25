/* options.js — every change is saved immediately. */

"use strict";

(() => {
    const { DEFAULTS, parseSites, comboFromEvent } = globalThis.AutoTagMateCommon;

    const $ = (id) => document.getElementById(id);
    const keyInput = $("activationKey");
    const keyError = $("keyError");
    const sitesInput = $("excludedSites");

    let savedKey = DEFAULTS.activationKey;
    let toastTimer = 0;

    function save(patch) {
        chrome.storage.sync.set(patch, () => {
            const toast = $("toast");
            toast.classList.add("show");
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => toast.classList.remove("show"), 1400);
        });
    }

    function setKeyError(message) {
        keyError.textContent = message;
        keyInput.classList.toggle("invalid", Boolean(message));
    }

    function saveKey(combo) {
        savedKey = combo;
        keyInput.value = combo;
        setKeyError("");
        save({ activationKey: combo });
    }

    /* ---- Activation key capture ---- */

    keyInput.addEventListener("keydown", (e) => {
        // Let the user leave the field with Shift+Tab without re-binding.
        if (e.key === "Tab" && e.shiftKey) return;
        e.preventDefault();
        e.stopPropagation();
        const { combo, complete, forbidden } = comboFromEvent(e);
        keyInput.value = combo;
        if (!complete) {
            setKeyError("");
            return;
        }
        if (forbidden) {
            setKeyError(t("optKeyForbidden"));
            return;
        }
        saveKey(combo);
    });

    // Releasing modifiers without pressing a main key restores the saved value.
    keyInput.addEventListener("keyup", (e) => {
        if (!comboFromEvent(e).complete && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey &&
            !keyError.textContent) {
            keyInput.value = savedKey;
        }
    });
    keyInput.addEventListener("blur", () => {
        keyInput.value = savedKey;
        setKeyError("");
    });

    $("resetKey").addEventListener("click", () => saveKey(DEFAULTS.activationKey));

    /* ---- Toggles ---- */

    for (const id of ["enabled", "autoCloseTag"]) {
        $(id).addEventListener("change", (e) => save({ [id]: e.target.checked }));
    }

    /* ---- Excluded sites: saved when the field loses focus ---- */

    sitesInput.addEventListener("change", () => {
        const sites = [...new Set(parseSites(sitesInput.value))];
        sitesInput.value = sites.join("\n");
        save({ excludedSites: sitesInput.value });
    });

    /* ---- Initial state and external changes (e.g. from the popup) ---- */

    function fill(items) {
        savedKey = items.activationKey;
        keyInput.value = savedKey;
        $("enabled").checked = items.enabled;
        $("autoCloseTag").checked = items.autoCloseTag;
        if (document.activeElement !== sitesInput) {
            sitesInput.value = parseSites(items.excludedSites).join("\n");
        }
    }

    chrome.storage.sync.get(DEFAULTS, fill);
    chrome.storage.onChanged.addListener((_, area) => {
        if (area === "sync") chrome.storage.sync.get(DEFAULTS, fill);
    });
})();
