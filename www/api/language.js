/**
 * @typedef {string} LANGUAGE
 * @enum {LANGUAGE}
 */
const LANGUAGE = {ENGLISH: 'en', GERMAN: 'de'};
const LANG_ATTR = 'lang';
const DEFAULT = LANGUAGE.ENGLISH;

/**
 * @returns {LANGUAGE}
 */
const getSystemLanguage = () => {
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
};

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
 * @returns {Promise<Object.<string,string>>}
 */
const loadLanguageMap = async (lang) => {
    const request = await fetch(`/app/language/${lang}.json`);
    return await request.json();
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
};

/**
 * @returns {Promise<void>}
 */
const update = async () => {
    const userLanguage = getSystemLanguage();
    setAppLanguageName(userLanguage);
    const locales = await loadLanguageMap(userLanguage);
    await translateDocument(userLanguage, locales);
};

export const language = {
    update: update,
    getSystemLanguage: getSystemLanguage
};