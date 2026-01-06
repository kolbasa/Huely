const {root} = await import('./root.js');

const LANGUAGE = {ENGLISH: 'en', GERMAN: 'de'};
const DEFAULT = LANGUAGE.ENGLISH;

const LANG_ATTR = 'lang';
const PLACEHOLDER = 'placeholder';

// const DEVICE_LANGUAGE = window.navigator.language;
const DEVICE_LANGUAGE = 'de-DE';
// const DEVICE_LANGUAGE = 'en-US';
// const DEVICE_LANGUAGE = 'fa-IR';

/**
 * @type {string}
 */
const userLanguage = (() => {
    const language = DEVICE_LANGUAGE;
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
    const request = await fetch(`${root.path}/app/language/${userLanguage}.json`);
    return await request.json();
})();

/**
 * @param {string} lang
 * @returns {void}
 */
const setAppLanguageName = (lang) => {
    const htmlEl = document.documentElement;
    if (htmlEl.lang === '{{lang}}') {
        htmlEl.setAttribute(LANG_ATTR, lang);
    }
};

/**
 * @param {string} lang
 * @param {Object.<string,string>} map
 * @returns {Promise<void>}
 */
async function translateDocument(lang, map) {
    const elements = document.querySelectorAll('[lang]');
    elements.forEach((element) => {
        if (element.tagName === 'HTML') {
            return;
        }
        const value = element.getAttribute(LANG_ATTR);
        const locale = map[value];
        if (locale == null) {
            element.innerHTML = value;
        } else {
            element.innerHTML = locale;
            element.removeAttribute(LANG_ATTR);
        }
    });
    const placeholder = document.querySelectorAll(`[${PLACEHOLDER}]`);
    placeholder.forEach((element) => {
        const value = element.getAttribute(PLACEHOLDER);
        const locale = map[value];
        if (locale == null) {
            element.setAttribute(PLACEHOLDER, value);
        } else {
            element.setAttribute(PLACEHOLDER, locale);
        }

    });
}

/**
 * @returns {Promise<void>}
 */
async function update() {
    setAppLanguageName(userLanguage);
    await translateDocument(userLanguage, locales);
}

/**
 * @param {string} locale
 * @returns {string}
 */
function translate(locale) {
    return locales[locale];
}

/**
 * @param {Object.<string,string>} map
 */
function addLocales(map) {
    for (let i in map) {
        locales[i] = map[i];
    }
}

export const language = {
    update: update,
    translate: translate,
    addLocales: addLocales,
    device: DEVICE_LANGUAGE
};