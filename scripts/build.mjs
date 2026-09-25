// scripts/build.mjs — copies only the extension files into dist/extension.
//
// Usage: node scripts/build.mjs [--tag v1.2.3]
// With --tag the script fails if the tag does not match manifest.json version.

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist", "extension");

// Everything the extension needs at runtime. Keep in sync with manifest.json.
const FILES = [
    "manifest.json",
    "background.js",
    "common.js",
    "content_script.js",
    "i18n.js",
    "popup.html",
    "popup.js",
    "options.html",
    "options.js",
    "css",
    "icons",
    "_locales"
];

const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));

const tagIndex = process.argv.indexOf("--tag");
if (tagIndex !== -1) {
    const tag = process.argv[tagIndex + 1] || "";
    if (tag.replace(/^v/, "") !== manifest.version) {
        console.error(`Tag "${tag}" does not match manifest.json version "${manifest.version}".`);
        process.exit(1);
    }
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const file of FILES) {
    const src = join(root, file);
    if (!existsSync(src)) {
        console.error(`Missing file: ${file}`);
        process.exit(1);
    }
    cpSync(src, join(out, file), { recursive: true });
}

console.log(`Built AutoTagMate ${manifest.version} -> dist/extension`);
