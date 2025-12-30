/**
 * @typedef {string} LANGUAGE
 * @enum {LANGUAGE}
 */
const LANGUAGE = {ENGLISH: 'en', GERMAN: 'de'};
const LANG_ATTR = 'lang';
const PLACEHOLDER = 'placeholder';
const DEFAULT = LANGUAGE.ENGLISH;

/**
 * @type {LANGUAGE}
 */
const userLanguage = (() => {
    const language = window.navigator.language;
    if (language == null) {
        return DEFAULT;
    }
    const abbreviation = language.split('-')[0];
    for (let i in LANGUAGE) {
        if (LANGUAGE[i] === abbreviation) {
            return abbreviation;
        }
    }
    return DEFAULT;
})();

/**
 * @type {Object.<string,string>}
 */
const locales = await (async () => {
    const request = await fetch(`/app/language/${userLanguage}.json`);
    return await request.json();
})();

/**
 * @param {LANGUAGE} lang
 * @returns {void}
 */
const setAppLanguageName = (lang) => {
    const htmlEl = document.documentElement;
    if (htmlEl.lang === '{{lang}}') {
        htmlEl.setAttribute(LANG_ATTR, lang);
    }
};

/**
 * @param {LANGUAGE} lang
 * @param {Object.<string,string>} map
 * @returns {Promise<void>}
 */
const translateDocument = async (lang, map) => {
    const elements = document.querySelectorAll('[lang]');
    elements.forEach((element) => {
        if (element.tagName === 'HTML') {
            return;
        }
        const value = element.getAttribute(LANG_ATTR);
        element.removeAttribute(LANG_ATTR);
        const locale = map[value];
        if (locale == null) {
            element.innerHTML = value;
            console.warn('Translation missing for: "' + value + '"');
        } else {
            element.innerHTML = locale;
        }
    });
    const placeholder = document.querySelectorAll(`[${PLACEHOLDER}]`);
    placeholder.forEach((element) => {
        const value = element.getAttribute(PLACEHOLDER);
        const locale = map[value];
        if (locale == null) {
            element.setAttribute(PLACEHOLDER, value);
            console.warn('Translation missing for: "' + value + '"');
        } else {
            element.setAttribute(PLACEHOLDER, locale);
        }

    });
};

/**
 * @returns {Promise<void>}
 */
const update = async () => {
    setAppLanguageName(userLanguage);
    await translateDocument(userLanguage, locales);
};

/**
 * @param {string} locale
 * @returns {string}
 */
const translate = (locale) => {
    return locales[locale];
};

export const language = {
    update: update,
    translate: translate
};