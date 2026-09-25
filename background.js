// background.js

"use strict";

const CONTENT_SCRIPT_FILES = ["common.js", "content_script.js"];

/**
 * Chrome does not inject content scripts into tabs that were already open when
 * the extension was installed or updated. Inject them manually so the
 * extension works right away, without reloading every page.
 */
async function injectIntoOpenTabs() {
    const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
    await Promise.all(tabs.map((tab) =>
        chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            files: CONTENT_SCRIPT_FILES
        }).catch(() => {
            // Chrome Web Store pages, discarded tabs, error pages etc.
            // cannot be scripted; nothing to do there.
        })
    ));
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
    injectIntoOpenTabs();
    if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.runtime.openOptionsPage();
    }
});
