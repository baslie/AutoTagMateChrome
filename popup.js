/* popup.js */

"use strict";

const { DEFAULTS, parseSites, isHostExcluded } = globalThis.AutoTagMateCommon;

const $ = (id) => document.getElementById(id);

let settings = { ...DEFAULTS };
let host = "";

function save(patch) {
    Object.assign(settings, patch);
    chrome.storage.sync.set(patch);
    render();
}

function render() {
    document.body.classList.toggle("off", !settings.enabled);
    $("enabled").checked = settings.enabled;
    $("autoCloseTag").checked = settings.autoCloseTag;
    $("autoCloseTag").disabled = !settings.enabled;

    const siteSupported = Boolean(host);
    $("site").textContent = siteSupported ? host : t("popupUnavailable");
    $("siteActive").disabled = !siteSupported || !settings.enabled;
    $("siteActive").checked = siteSupported && !isHostExcluded(host, parseSites(settings.excludedSites));

    $("key").textContent = settings.activationKey;
    const hint = $("hint");
    hint.textContent = t("popupHint", [settings.activationKey]) + ": ";
    const example = document.createElement("code");
    example.textContent = "prompt → <prompt></prompt>";
    hint.append(example);
}

$("enabled").addEventListener("change", (e) => save({ enabled: e.target.checked }));
$("autoCloseTag").addEventListener("change", (e) => save({ autoCloseTag: e.target.checked }));

$("siteActive").addEventListener("change", (e) => {
    const sites = parseSites(settings.excludedSites);
    const next = e.target.checked
        // Remove every entry that covers this host (e.g. "example.com" for "www.example.com").
        ? sites.filter((site) => !isHostExcluded(host, [site]))
        : [...sites, host];
    save({ excludedSites: next.join("\n") });
});

$("openOptions").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
    window.close();
});

$("version").textContent = "v" + chrome.runtime.getManifest().version;

Promise.all([
    chrome.storage.sync.get(DEFAULTS),
    chrome.tabs.query({ active: true, currentWindow: true })
]).then(([items, [tab]]) => {
    settings = { ...DEFAULTS, ...items };
    try {
        const url = new URL(tab && tab.url);
        if (url.protocol === "http:" || url.protocol === "https:") host = url.hostname;
    } catch (_) { /* no URL: chrome:// page, new tab, etc. */ }
    render();
});
