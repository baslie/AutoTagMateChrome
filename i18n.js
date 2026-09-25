/* i18n.js — fills elements marked with data-i18n* attributes from _locales. */

"use strict";

function t(key, substitutions) {
    return chrome.i18n.getMessage(key, substitutions) || key;
}

function localizePage() {
    document.documentElement.lang = chrome.i18n.getUILanguage();
    for (const el of document.querySelectorAll("[data-i18n]")) {
        el.textContent = t(el.dataset.i18n);
    }
    for (const el of document.querySelectorAll("[data-i18n-placeholder]")) {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    }
    for (const el of document.querySelectorAll("[data-i18n-title]")) {
        el.title = t(el.dataset.i18nTitle);
    }
}

localizePage();
