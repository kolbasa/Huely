const {app} = await import('./../api/native/app.js');
const {toast} = await import('./../api/native/toast.js');
const {modal} = await import('./../api/modal.js');

/**
 * @type {Number}
 */
let _backButtonTimer;

/**
 * @returns {Promise<void>}
 */
async function onDoubleClick() {
    if (await modal.close()) {
        return;
    }

    await toast.show('PRESS_AGAIN_TO_EXIT');

    if (_backButtonTimer != null) {
        return app.exit();
    }

    _backButtonTimer = setTimeout(() => {
        _backButtonTimer = null;
    }, 1500);
}

/**
 * @returns {Promise<void>}
 */
async function onDoubleBackButton() {
    await app.backButtonListener(onDoubleClick);
}

export const exit = {onDoubleBackButton: onDoubleBackButton};
