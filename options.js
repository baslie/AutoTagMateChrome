/* options.js */

"use strict";

/**
 * Formats a key combination into a string, for example "Ctrl+Shift+P".
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {string} - The formatted key combination.
 */
function formatKeyCombination(e) {
    let keys = [];
    if (e.ctrlKey) keys.push("Ctrl");
    if (e.altKey) keys.push("Alt");
    if (e.shiftKey) keys.push("Shift");
    if (e.metaKey) keys.push("Meta");

    // If a non-modifier key is pressed, add it.
    let key = e.key;
    if (!["Control", "Shift", "Alt", "Meta"].includes(key)) {
        keys.push(key.length === 1 ? key.toUpperCase() : key);
    }
    return keys.join("+");
}

// Load saved settings when the page loads.
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get({
        activationKey: "Tab",
        autoCloseTag: true,
        excludedSites: ""
    }, (items) => {
        const activationKeyInput = document.getElementById("activationKey");
        activationKeyInput.value = items.activationKey;
        document.getElementById("autoCloseTag").checked = items.autoCloseTag;
        document.getElementById("excludedSites").value = items.excludedSites;
    });
});

// Capture the key combination for the activation key field.
const activationKeyInput = document.getElementById("activationKey");
activationKeyInput.addEventListener("keydown", function(e) {
    e.preventDefault();
    const combo = formatKeyCombination(e);
    this.value = combo;
});

// Handle the submission of the settings form.
document.getElementById("optionsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const activationKey = document.getElementById("activationKey").value || "Tab";
    const autoCloseTag = document.getElementById("autoCloseTag").checked;
    const excludedSites = document.getElementById("excludedSites").value;

    chrome.storage.sync.set({
        activationKey: activationKey,
        autoCloseTag: autoCloseTag,
        excludedSites: excludedSites
    }, () => {
        const status = document.getElementById("status");
        status.textContent = "Settings saved.";
        setTimeout(() => {
            status.textContent = "";
        }, 1500);
    });
});
