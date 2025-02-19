/* content_script.js */

/* ============================================
   1. Utility Functions
   ============================================ */

/**
 * Проверяет, является ли элемент редактируемым.
 * @param {Element} el - HTML-элемент.
 * @returns {boolean} - true, если элемент редактируемый.
 */
function isEditableElement(el) {
    return (
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable
    );
}

/**
 * Проверяет, есть ли выделение в элементе.
 * @param {Element} el - HTML-элемент.
 * @returns {boolean} - true, если в элементе есть выделение.
 */
function hasSelection(el) {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        return el.selectionStart !== el.selectionEnd;
    } else if (el.isContentEditable) {
        const sel = window.getSelection();
        return sel && !sel.isCollapsed;
    }
    return false;
}

/* ============================================
   2. Tag Wrapping Functions
   ============================================ */

/**
 * Оборачивает выделенный текст в теги.
 * Для input/textarea: заменяет выделение на <текст></текст> (без содержимого между тегами).
 * Для contenteditable: удаляет выделенное содержимое и вставляет текстовый узел с тегами.
 * @param {Element} el - редактируемый HTML-элемент.
 */
function wrapSelectedText(el) {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = el.value.substring(start, end).trim();
        if (!selected) return;

        const openingTag = `<${selected}>`;
        const closingTag = `</${selected}>`;
        // Заменяем выделенный текст на теги без содержимого между ними.
        const newText = el.value.substring(0, start) + openingTag + closingTag + el.value.substring(end);
        el.value = newText;
        // Устанавливаем курсор между тегами.
        const newPos = start + openingTag.length;
        el.selectionStart = el.selectionEnd = newPos;
    } else if (el.isContentEditable) {
        const sel = window.getSelection();
        if (sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        const selectedText = sel.toString().trim();
        if (!selectedText) return;

        const openingTag = `<${selectedText}>`;
        const closingTag = `</${selectedText}>`;
        // Формируем строку только из открывающего и закрывающего тега.
        const newText = openingTag + closingTag;
        // Удаляем выделенное содержимое и вставляем новый текстовый узел.
        range.deleteContents();
        const textNode = document.createTextNode(newText);
        range.insertNode(textNode);
        // Устанавливаем курсор между тегами (после открывающего тега).
        const newRange = document.createRange();
        newRange.setStart(textNode, openingTag.length);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
    }
}

/**
 * Оборачивает последнее слово перед курсором в теги.
 * Если элемент содержит несколько слов, используется только последнее слово.
 * @param {Element} el - редактируемый HTML-элемент.
 */
function wrapTextBeforeCursor(el) {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        const start = el.selectionStart;
        const text = el.value;
        const beforeCursor = text.substring(0, start);
        // Находим последнее слово (без пробелов)
        const match = beforeCursor.match(/(\S+)$/);
        if (!match) return;
        const word = match[1];
        const regionStart = start - word.length;
        const openingTag = `<${word}>`;
        const closingTag = `</${word}>`;
        // Заменяем последнее слово на структуру тегов без содержимого.
        const newText = text.substring(0, regionStart) + openingTag + closingTag + text.substring(start);
        el.value = newText;
        // Устанавливаем курсор между открывающим и закрывающим тегом.
        const newPos = regionStart + openingTag.length;
        el.selectionStart = el.selectionEnd = newPos;
    } else if (el.isContentEditable) {
        const sel = window.getSelection();
        if (sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        const container = range.startContainer;
        if (container.nodeType !== Node.TEXT_NODE) return;
        const text = container.textContent;
        const offset = range.startOffset;
        const beforeCursor = text.substring(0, offset);
        const match = beforeCursor.match(/(\S+)$/);
        if (!match) return;
        const word = match[1];
        const wordStart = offset - word.length;
        const openingTag = `<${word}>`;
        const closingTag = `</${word}>`;
        const newTagText = openingTag + closingTag;
        const before = text.substring(0, wordStart);
        const after = text.substring(offset);
        container.textContent = before + newTagText + after;
        // Устанавливаем курсор между тегами.
        const newOffset = before.length + openingTag.length;
        const newRange = document.createRange();
        newRange.setStart(container, newOffset);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
    }
}

/* ============================================
   3. Auto-Close Tag Function
   ============================================ */

/**
 * Автоматически закрывает тег при вводе символа ">".
 * @param {Element} el - редактируемый HTML-элемент.
 */
function autoCloseTag(el) {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        const pos = el.selectionStart;
        const text = el.value;
        const lastLt = text.lastIndexOf("<", pos);
        if (lastLt === -1) return;
        const tagCandidate = text.substring(lastLt, pos);
        // Регулярное выражение для захвата имени тега (поддержка дефиса).
        const m = tagCandidate.match(/^<\s*([\w\s\-]+)\s*>$/);
        if (m) {
            let tagName = m[1].trim();
            if (!tagName) return;
            const closingTag = `</${tagName}>`;
            const newText = text.substring(0, pos) + closingTag + text.substring(pos);
            el.value = newText;
            el.selectionStart = el.selectionEnd = pos;
        }
    } else if (el.isContentEditable) {
        const sel = window.getSelection();
        if (sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        const container = range.startContainer;
        if (container.nodeType !== Node.TEXT_NODE) return;
        const text = container.textContent;
        const offset = range.startOffset;
        const lastLt = text.lastIndexOf("<", offset);
        if (lastLt === -1) return;
        const tagCandidate = text.substring(lastLt, offset);
        const m = tagCandidate.match(/^<\s*([\w\s\-]+)\s*>$/);
        if (m) {
            let tagName = m[1].trim();
            if (!tagName) return;
            const closingTag = `</${tagName}>`;
            const before = text.substring(0, offset);
            const after = text.substring(offset);
            container.textContent = before + closingTag + after;
            const newRange = document.createRange();
            newRange.setStart(container, offset);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
        }
    }
}

// Значения по умолчанию – будут обновлены из chrome.storage.
let activationKey = "Tab"; // Клавиша активации по умолчанию.
let enableAutoClose = true; // Автозакрытие тега включено по умолчанию.
let excludedSites = ""; // Исключенные сайты

// Проверка, не находится ли текущий сайт в списке исключенных
function isExcludedSite() {
    if (!excludedSites) return false;
    
    const currentHost = window.location.hostname;
    const excludedArray = excludedSites.split(',').map(site => site.trim());
    
    return excludedArray.some(site => 
        currentHost === site || 
        currentHost.endsWith('.' + site) || 
        site.startsWith('*.') && currentHost.endsWith(site.substring(1))
    );
}

// Загружаем настройки из chrome.storage.sync.
function loadSettings() {
    chrome.storage.sync.get({
        activationKey: "Tab",
        autoCloseTag: true,
        excludedSites: ""
    }, (items) => {
        activationKey = items.activationKey;
        enableAutoClose = items.autoCloseTag;
        excludedSites = items.excludedSites;
        
        // Если на исключенном сайте - можно отключить обработчик событий
        if (isExcludedSite()) {
            console.log("AutoTagMate: текущий сайт в списке исключенных");
            document.removeEventListener("keydown", keydownHandler);
        } else {
            // Убедимся, что обработчик добавлен
            document.addEventListener("keydown", keydownHandler);
        }
    });
}

// Загружаем настройки при запуске
loadSettings();

// Подписываемся на изменения настроек
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
        if (changes.activationKey) {
            activationKey = changes.activationKey.newValue;
        }
        if (changes.autoCloseTag) {
            enableAutoClose = changes.autoCloseTag.newValue;
        }
        if (changes.excludedSites) {
            excludedSites = changes.excludedSites.newValue;
            
            // Перепроверяем, не должен ли быть отключен обработчик
            if (isExcludedSite()) {
                document.removeEventListener("keydown", keydownHandler);
            } else {
                document.addEventListener("keydown", keydownHandler);
            }
        }
    }
});

// Выносим обработчик событий в отдельную функцию, чтобы его можно было удалить
function keydownHandler(e) {
    const target = e.target;
    if (!isEditableElement(target)) return;

    // Проверяем, соответствует ли нажатие клавиши установленной комбинации
    let keyMatches = false;
    
    if (activationKey === "Tab" && e.key === "Tab" && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        keyMatches = true;
    } else {
        // Разбираем пользовательскую комбинацию
        const parts = activationKey.split('+');
        
        // Проверяем модификаторы
        const hasCtrl = parts.includes("Ctrl");
        const hasAlt = parts.includes("Alt");
        const hasShift = parts.includes("Shift");
        const hasMeta = parts.includes("Meta");
        
        // Последняя часть обычно клавиша (не модификатор)
        const mainKey = parts.filter(p => !["Ctrl", "Alt", "Shift", "Meta"].includes(p))[0];
        
        // Проверяем соответствие модификаторов и клавиши
        if (e.ctrlKey === hasCtrl && 
            e.altKey === hasAlt && 
            e.shiftKey === hasShift && 
            e.metaKey === hasMeta &&
            (e.key.toLowerCase() === mainKey.toLowerCase() || 
             e.code === 'Key' + mainKey)) {
            keyMatches = true;
        }
    }

    if (keyMatches) {
        e.preventDefault(); // Предотвращаем стандартное поведение.
        if (hasSelection(target)) {
            wrapSelectedText(target);
        } else {
            wrapTextBeforeCursor(target);
        }
    }

    // Обработка автозакрытия тега при вводе символа ">".
    if (enableAutoClose && e.key === ">") {
        // Ждём вставки символа и затем выполняем автозакрытие.
        setTimeout(() => {
            autoCloseTag(target);
        }, 0);
    }
}

// Отслеживаем события клавиатуры через делегирование.
document.addEventListener("keydown", keydownHandler);