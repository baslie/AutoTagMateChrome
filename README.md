# AutoTagMate

**AutoTagMate** is a browser extension that automatically wraps entered text in HTML-like tags in input fields (`<input>`, `<textarea>`) and in elements with the `contenteditable` attribute. While originally designed to help with quick HTML wrapping, **AutoTagMate** also excels at structuring AI prompts for ChatGPT, Claude AI, or any other neural network-based system—making your prompts clearer and more focused.

---

## Why It's Perfect for AI Work

- **Boost Prompt Clarity:** By automatically wrapping text in tags, you can separate different sections of your prompt (instructions, examples, code snippets, etc.)—helping the AI understand your intentions more precisely.
- **Zero Hassle:** Use a customizable activation key (e.g., `Tab`, `Ctrl+\`, or any other key combo) for instant wrapping. After typing an opening tag and “>”, the extension auto-inserts the matching closing tag—so you never have to worry about mismatched pairs.
- **Exclude Sites Where You Don’t Need It:** Specify platforms or pages where the extension should be disabled, focusing all your tagging power on the exact areas you need.

---

## Functionality

1. **Wrapping text in tags:**
   - **Without selection:** When the cursor is placed without any selected text, AutoTagMate detects the word or phrase immediately before the cursor and wraps it in `<text></text>`.
   - **With selection:** If some text is selected, AutoTagMate wraps the selection directly in `<text></text>`.

2. **Automatic tag closing:** Whenever you type an opening tag followed by the `>` character (e.g., `<Example>`), the extension automatically adds `</Example>` right after the cursor.

3. **Settings:**
   - **Activation key:** You can set any key combination on the fly. Click in the input field on the settings page, press your desired combination (e.g., `Ctrl+\`), and it will be saved automatically.
   - **Enable/disable auto tag closing:** Turn off auto-closure if you prefer manual closing.
   - **Excluded sites:** Maintain a list of websites where the extension will not run.

4. **Tailwind CSS-based design:** The extension’s settings page (popup) is styled with Tailwind CSS. The main CSS file `all.css` is located in the `css` folder.

---

## Also Great for Quick HTML Wrapping

Although AutoTagMate is especially useful for structuring prompts, it remains a powerful tool for developers, bloggers, and content creators. When you need to wrap text in HTML tags quickly—be it for website editing or simple markup—AutoTagMate saves time by handling closing tags for you automatically.

---

## Privacy Policy

- **No external servers:** AutoTagMate does not send any data outside. All processing occurs locally in your browser.
- **Local storage only:** Any settings (activation key, auto-close preference, excluded sites) are stored in your browser’s `chrome.storage` and do not leave your computer.

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

1. Clone or download this project.
2. (Optional) Generate or update the CSS via Tailwind CLI (if you need to modify it), producing `css/all.css`.
3. In Google Chrome, navigate to `chrome://extensions/`.
4. Enable **Developer Mode**.
5. Click **Load unpacked** and select the project folder.
6. AutoTagMate will install and become active on all pages.

---

## Usage

1. **Wrapping text for AI prompts or HTML:**  
   - Place your cursor in an input or `contenteditable` field, type a word or phrase, and press your configured activation key (default is `Tab` or your chosen combo).
   - If text is highlighted, it will be wrapped in the tags directly.
   - If no text is selected, the word before the cursor will be wrapped in `<text></text>`, and the cursor will be placed between the tags.

2. **Automatic tag closing:**  
   - When you type an opening tag (e.g., `<Example>`), AutoTagMate instantly inserts `</Example>` right after the cursor.

3. **Settings page (popup):**  
   - Adjust your activation key, toggle auto tag-closing on/off, or manage excluded websites.

---

## Additional Features

- **Key Combination Selection:**  
  On the settings page, simply press your desired key combo (e.g., `Ctrl+\`) to configure the activation shortcut instead of typing it out manually.
- **Focus on AI Prompt Structuring:**  
  Build clear, well-structured prompts for ChatGPT, Claude AI, or any other generative model by automatically marking sections, instructions, or examples with tags.
- **Tailwind CSS:**  
  The stylish settings page is powered by Tailwind CSS, with its main stylesheet located in `css/all.css`.

---

## License

This project is licensed under the MIT License.
