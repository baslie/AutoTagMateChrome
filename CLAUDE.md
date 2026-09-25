# AutoTagMate — заметки для Claude

Chrome-расширение (Manifest V3, чистый JS без сборщика). Репозиторий **публичный** (`baslie/AutoTagMateChrome`), поэтому никаких ключей в файлах.

## Архитектура
- `common.js` — общие хелперы (`globalThis.AutoTagMateCommon`): настройки по умолчанию, разбор сочетаний клавиш и списка сайтов. Подключается и в content script, и в popup/options.
- `content_script.js` — вся логика. Текст меняется только через `document.execCommand("insertText")` (с фолбэком), иначе ChatGPT/Claude (ProseMirror) и React-поля теряют правку и ломается Ctrl+Z.
- Скрипт может быть внедрён повторно (`background.js` при install/update). Старый экземпляр снимает обработчики по событию `autotagmate:teardown`.
- `options.html` подключает `content_script.js` напрямую — для поля «Попробуйте» (в страницы расширения content scripts не внедряются). Поля, где обёртка не нужна, помечены `data-autotagmate="off"`.
- Строки UI — в `_locales/{en,ru}/messages.json`, в HTML через `data-i18n*`.
- Новый файл расширения нужно добавить в список `FILES` в `scripts/build.mjs`.

## Релиз в Chrome Web Store
- Workflow `.github/workflows/release.yml` запускается по push тега `vX.Y.Z`; тег обязан совпадать с `version` в `manifest.json`.
- Порядок: поднять `version` → коммит → `git tag vX.Y.Z` → `git push origin main --tags` (push делает Роман или по его явному «да»).
- Секреты в GitHub Secrets: `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN`, `CWS_PUBLISHER_ID`, `CWS_EXTENSION_ID`.
- Publisher ID: `05594428-f444-4eab-a40d-8636bda87c61`, Extension ID: `glpeklpobckdibinochanehcbpmipkik` (не секретные).
- Chrome Web Store API v1 отключается 15.10.2026; используем v2 через `chrome-webstore-upload-cli@4`.
- Dashboard стора (`chrome.google.com/webstore/devconsole`) нельзя автоматизировать через Claude in Chrome — карточку, скриншоты и Privacy правит Роман вручную.
