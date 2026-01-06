const {dom} = await import('./../api/dom.js');
const {language} = await import('./../api/language.js');

/**
 * @type {function():void}
 */
let _removeModal = undefined;

/**
 * @returns {Promise<boolean>}
 */
async function closeModal() {
    if (_removeModal == null) {
        return false;
    }
    _removeModal();
    _removeModal = undefined;
    delete window.closeModal;
    return true;
}

/**
 * @param {string} path
 * @returns {Promise<void>}
 */
async function showModal(path) {
    await closeModal();
    path = `${path}${path.split('/').filter(Boolean).pop()}`;
    _removeModal = await dom.appendToBody(`${path}.html`, `${path}.css`);
    await language.update();
    const dialog = dom.element('dialog');
    if (dialog['showModal'] == null) {
        return;
    }
    dialog.showModal();
    window.closeModal = closeModal;
}

export const modal = {
    show: showModal,
    close: closeModal
};
