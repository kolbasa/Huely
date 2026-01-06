const {app} = await import('./../api/native/app.js');
const {dom} = await import('./../api/dom.js');

/**
 * @type {number}
 */
let _optionsTimeoutId = undefined;

/**
 * @param {HTMLElement} el
 * @param {boolean} active
 */
function setActive(el, active) {
    el.parentElement.classList[active ? 'add' : 'remove']('active');
}

/**
 * @param {HTMLElement} el
 * @param {function} callback
 * @returns {void}
 */
function onTouchStart(el, callback) {
    setActive(el, true);
    _optionsTimeoutId = setTimeout(async () => {
        setActive(el, false);
        callback();
    }, 900);
}

/**
 * @param {HTMLElement} el
 * @returns {void}
 */
function onTouchEnd(el) {
    setActive(el, false);
    if (_optionsTimeoutId == null) {
        return;
    }
    clearTimeout(_optionsTimeoutId);
    _optionsTimeoutId = undefined;
}

/**
 * @param {HTMLElement} el
 * @param {function} callback
 */
function deviceLongPress(el, callback) {
    el.addEventListener('touchstart', () => onTouchStart(el, callback));
    el.addEventListener('touchend', () => onTouchEnd(el));
}

/**
 * @param {HTMLElement} el
 * @param {function} callback
 */
function browserLongPress(el, callback) {
    el.addEventListener('mousedown', () => onTouchStart(el, callback));
    el.addEventListener('mouseup', () => onTouchEnd(el));
}

/**
 * @param {string} elementClass
 * @param {function} callback
 * @returns {void}
 */
function addLongPressEventListener(elementClass, callback) {
    const trackerEl = dom.element(elementClass);
    if (app.isDesktop()) {
        browserLongPress(trackerEl, callback);
    } else {
        deviceLongPress(trackerEl, callback);
    }
}

export const touch = {
    onLongPress: addLongPressEventListener
};
