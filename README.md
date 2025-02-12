# AutoTagMate for Chrome: Your Ultimate HTML Tag Assistant 🚀

Tired of manually typing HTML tags every time you write or edit text on the web? **AutoTagMate** extension is here to boost your productivity by effortlessly wrapping your text in HTML tags with a single key press. Whether you’re coding, writing content, or crafting AI prompts, AutoTagMate streamlines your workflow and reduces errors.

---

## Key Features

- **Smart Tag Wrapping:**  
  AutoTagMate instantly detects the word or phrase immediately before your cursor—or wraps selected text—with matching HTML tags. Say goodbye to tedious manual typing!

- **Automatic Tag Closure:**  
  When you type an opening tag (e.g., `<Example>`), the extension automatically inserts the corresponding closing tag (`</Example>`), ensuring your HTML is always correctly structured.

- **Customizable Activation Key:**  
  Set your preferred keyboard shortcut (such as Tab, Ctrl+P, or any combination) to trigger tag wrapping on the fly, perfectly fitting into your workflow.

- **Excluded Sites Option:**  
  Choose specific websites where you don’t want AutoTagMate to run, so you get assistance only where you need it most.

- **Ideal for AI Prompt Crafting:**  
  Enhance your prompt writing for ChatGPT, Claude AI, and other neural network-based assistants by quickly formatting your instructions with clear HTML tags.

- **Clean, Modern Interface:**  
  The intuitive settings page, styled with Tailwind CSS, allows you to easily adjust your preferences. Enjoy a sleek, lightweight extension that integrates seamlessly with your browser.

---

## How It Works

1. **Easy Installation:**  
   Simply add AutoTagMate from the Chrome Web Store or load the extension as unpacked from your project folder in Chrome’s extensions page (`chrome://extensions/`). It starts working immediately on all text fields and content-editable areas.

2. **Effortless Usage:**  
   - **Tag Wrapping:** Type your text normally, then press your configured activation key to wrap the word before the cursor (or the selected text) in HTML tags.
   - **Automatic Tag Closure:** As soon as you type an opening tag and hit `>`, AutoTagMate inserts the corresponding closing tag automatically.

3. **Customize Your Experience:**  
   Access the settings via the extension icon or the options page to:
   - Change the activation key,
   - Toggle auto tag-closing on or off,
   - Specify a list of excluded sites—all from one convenient interface.

---

## Installation

1. **Clone or Download the Project:**  
   Obtain the project repository from your preferred source.

2. **Generate CSS (if needed):**  
   If necessary, generate the `css/all.css` file (for example, using the Tailwind CLI).

3. **Load the Extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode."
   - Click "Load unpacked" and select the project folder.
   - AutoTagMate will be installed and active on all applicable pages.

---

## Project Structure

```plaintext
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

## Who Benefits

- **Web Developers & Designers:**  
  Enhance your coding efficiency and minimize syntax errors by letting AutoTagMate handle repetitive tag insertions.

- **Content Creators & Bloggers:**  
  Streamline your editing process and effortlessly format your content without distractions.

- **AI Enthusiasts & Prompt Writers:**  
  Perfect your AI prompt structure for tools like ChatGPT and Claude AI by clearly delineating your content with HTML tags.

---

## License

This project is licensed under the [MIT License](LICENSE).
