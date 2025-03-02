# AutoTagMate

**AutoTagMate** is a browser extension that automatically wraps the entered text in HTML tags in input fields (`input`, `textarea`) and in elements with the `contenteditable` attribute.

---

## Functionality

- **Wrapping text in tags:**
  - **Without selection:** If the cursor is placed without any selected text, the extension identifies the word or phrase immediately before the cursor and wraps it with tags in the format `<text></text>`.
  - **With selection:** If text is selected, it will be wrapped with similar tags.
- **Automatic tag closing:** When an opening tag and the `>` character are typed, the extension automatically inserts the corresponding closing tag.
- **Settings:**
  - **Activation key:** You can now set a key combination on the fly: simply click in an input field, press the desired combination (for example, Ctrl+P) and it will be automatically captured.
  - **Enable/disable auto tag closing.**
  - **Excluded sites:** Specify a list of websites on which the extension will not run.
- **Settings design:** The settings page is styled using Tailwind CSS. The main CSS file `all.css` is located in the `css` folder.

---

## Privacy Policy

We do not collect or transmit any personal data. All processing is done locally in your browser.  
- **No external servers**: The extension does not send any data outside.  
- **Local storage only**: Any settings (activation key, auto-close preference, or excluded sites) are kept solely in the browser's `chrome.storage`.  

---

## Project Structure

```
AutoTagMate/
├── manifest.json
├── background.js
├── content_script.js
├── options.html
├── options.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── css/
    └── all.css
```

---

## Installation

1. Clone or download the project.
2. If necessary, generate the `css/all.css` file (for example, using Tailwind CLI).
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable "Developer mode".
5. Click "Load unpacked" and select the project folder.
6. The extension will be installed and active on all pages.

---

## Usage

- **Wrapping text:**  
  In an input field or an editor supporting `contenteditable`, type a word or phrase and press the configured activation key (default is Tab or the chosen combination). The text will be transformed into `<text></text>`, with the cursor positioned between the tags.
- **Automatic tag closing:**  
  When you type an opening tag (for example, `<Example>`), the extension automatically inserts `</Example>` immediately after the cursor.
- **Settings:**  
  Click the extension icon or open the settings page (popup) to change the activation key, enable/disable auto tag closing, or specify a list of excluded websites.

---

## Additional Features

- **Key combination selection:**  
  In the settings page, instead of manually entering the key combination, the user can simply press the desired combination (for example, Ctrl+P) and it will be automatically captured.
- **Tailwind CSS:**  
  The settings page is styled using Tailwind CSS. The file `all.css` is located in the `css` folder.

---

## License

This project is licensed under the MIT License.