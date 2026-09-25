# AutoTagMate

**AutoTagMate** is a Chrome extension that wraps a word in HTML-like tags with one key press and auto-closes tags as you type. It works in plain `<input>` / `<textarea>` fields and in rich editors (`contenteditable`) — including ChatGPT, Claude and Gmail — which makes it a handy tool for structuring AI prompts:

```
instructions  →  press Tab  →  <instructions>|</instructions>
```

[Chrome Web Store](https://chromewebstore.google.com/detail/autotagmate/glpeklpobckdibinochanehcbpmipkik)

---

## Features

- **Wrap the word before the cursor.** Type `context`, press the activation key (default `Tab`) — you get `<context></context>` with the cursor between the tags.
- **Wrap a selection.** Select text and press the key — the selection becomes the tag name.
- **Auto-close tags.** Type `<example>` and `</example>` appears right after the cursor. Cyrillic and other scripts are supported (`<пример>`).
- **Plays nice with editors.** Changes go through the browser's editing pipeline, so React / ProseMirror editors keep their state and `Ctrl+Z` undoes the change.
- **Tab still works.** If there is nothing to wrap, the key does what it normally does (e.g. moves focus).
- **Popup controls.** Turn the extension off globally or just for the current site in one click.
- **Any shortcut.** Pick any combination on the settings page; letters are layout-independent (`Ctrl+P` works on a Russian layout too).
- **Excluded sites**, light/dark theme, English and Russian UI.

## Privacy

AutoTagMate does not collect or send any data. All processing happens locally; settings are stored in `chrome.storage.sync`.

The extension asks for access to all sites because it has to work in any text field. The `scripting` permission is only used to start the extension in tabs that were already open when it was installed or updated.

---

## Project structure

```
├── manifest.json
├── background.js          # injects the content script into open tabs on install/update
├── common.js              # shared helpers: defaults, shortcut and site parsing
├── content_script.js      # wrapping and auto-closing logic
├── popup.html / popup.js  # toolbar popup
├── options.html / options.js  # settings page with a "Try it" field
├── i18n.js                # fills data-i18n attributes from _locales
├── css/ui.css
├── _locales/{en,ru}/messages.json
├── icons/
├── scripts/build.mjs      # copies extension files into dist/extension
└── .github/workflows/release.yml
```

## Development

1. Open `chrome://extensions`, enable **Developer mode**.
2. **Load unpacked** → select this folder.
3. After editing files press the reload button on the extension card.

`npm run build` copies only the files the extension needs into `dist/extension`.

## Release

Releases are published to the Chrome Web Store automatically by GitHub Actions (Chrome Web Store API v2):

1. Bump `version` in `manifest.json` and commit.
2. Create and push a tag with the same version:
   ```bash
   git tag v1.1.0
   git push origin main --tags
   ```
3. The **Release** workflow builds the zip, uploads it, submits it for review (the new version goes live automatically once approved) and attaches the zip to a GitHub release.

The workflow needs these repository secrets: `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN`, `CWS_PUBLISHER_ID`, `CWS_EXTENSION_ID`.

The store listing (description, screenshots, privacy answers) is not changed by the API — edit it in the [Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## License

MIT
