await import('../../app.js');

const {app} = await import('../../../api/native/app.js');
const {dom} = await import('../../../api/dom.js');
const {toast} = await import('../../../api/native/toast.js');
const {state} = await import('../../../api/routing/state.js');
const {states} = await import('../../../app/states/states.js');
const {router} = await import('../../../api/routing/router.js');
const {backup} = await import('../../database/import-export.js');
const {haptics} = await import('../../../api/native/haptics.js');
const {statusbar} = await import('../../../api/native/statusbar.js');
const {trackers} = await import('../../database/trackers.js');
const {language} = await import('../../../api/language.js');

/* -------------------- Tracker List -------------------- */

/**
 * @returns {Promise<void>}
 */
async function refreshList() {
    const list = await trackers.list();
    dom.repeat('tracker', list.length, {
        id: (index) => index,
        name: (index) => {
            return list[index].name;
        }
    });
    list.forEach(addLongPressEventListener);
}

let _waitingFor;

/**
 * @returns {void}
 */
async function onBackButton() {
    if (_removeDialog != null) {
        closeModal();
        return;
    }

    await toast.show('PRESS_AGAIN_TO_EXIT');

    if (_waitingFor != null) {
        return app.exit();
    }

    _waitingFor = setTimeout(() => {
        _waitingFor = null;
    }, 1500);
}

/**
 * @returns {void}
 */
window.load = async () => {
    await refreshList();
    await app.backButtonListener(onBackButton);
    await app.stateChangeListener(closeModal);
    await statusbar.hide();
    await debugReloadState();
};

/* ------------------------------------------------------ */
/*                         Dialog                         */
/* ------------------------------------------------------ */

/**
 * @type {Tracker}
 */
let _editedTracker = undefined;

/**
 * @type {function():void}
 */
let _removeDialog = undefined;

/**
 * @param {string} type
 * @returns {Promise<void>}
 */
async function appendDialog(type) {
    closeModal();
    const path = `./dialog/${type}/${type}`;
    _removeDialog = await dom.appendToBody(`${path}.html`, `${path}.css`);
    await language.update();
    const dialog = dom.element('dialog');
    if (dialog['showModal'] == null) {
        return;
    }
    dialog.showModal();
}

/**
 * @param {FormData} form
 * @returns {void}
 */
async function onCreate(form) {
    if (form['name'] == null) {
        return;
    }
    await trackers.add(dom.sanitize(form.name));
    closeModal();
    await refreshList();
}

/**
 * @returns {Promise<void>}
 */
window.createDialog = async () => {
    await appendDialog('create');
    setTimeout(() => dom.focus('name'), 50);
    dom.onFormSubmit('create', onCreate);
};

/**
 * @param {FormData} form
 * @returns {void}
 */
async function onUpdate(form) {
    if (form['name'] == null) {
        return;
    }
    _editedTracker.name = dom.sanitize(form.name);
    await trackers.update(_editedTracker);
    closeModal();
    await refreshList();
}

/**
 * @param {Tracker} tracker
 * @returns {Promise<void>}
 */
async function updateDialog(tracker) {
    await appendDialog('update');
    _editedTracker = tracker;
    dom.setValue('name', tracker.name);
    dom.onFormSubmit('update', onUpdate);
}

/**
 * @returns {Promise<void>}
 */
window.deleteDialog = async () => {
    await appendDialog('delete');
    await new Promise(resolve => setTimeout(resolve, 50));
    dom.show('dialog');
};

/**
 * @returns {Promise<void>}
 */
window.deleteTracker = async () => {
    if (_editedTracker != null) {
        await trackers.remove(_editedTracker);
    }
    closeModal();
    await refreshList();
};

/**
 * @returns {void}
 */
window.closeModal = function () {
    if (_removeDialog == null) {
        return;
    }
    _removeDialog();
    _removeDialog = undefined;
};

/* ------------------------------------------------------ */
/*                    Tracker Options                     */
/* ------------------------------------------------------ */

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
 * @param {Tracker} tracker
 * @param {HTMLElement} el
 * @returns {void}
 */
function onTouchStart(tracker, el) {
    setActive(el, true);
    _optionsTimeoutId = setTimeout(async () => {
        setActive(el, false);
        await updateDialog(tracker);
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
 * @param {Tracker} tracker
 */
function deviceLongPress(el, tracker) {
    el.addEventListener('touchstart', () => onTouchStart(tracker, el));
    el.addEventListener('touchend', () => onTouchEnd(el));
}

/**
 * @param {HTMLElement} el
 * @param {Tracker} tracker
 */
function browserLongPress(el, tracker) {
    el.addEventListener('mousedown', () => onTouchStart(tracker, el));
    el.addEventListener('mouseup', () => onTouchEnd(el));
}

/**
 * @param {Tracker} tracker
 * @param {number} index
 * @returns {void}
 */
function addLongPressEventListener(tracker, index) {
    const trackerEl = dom.element(`t${index}`);
    if (app.isDebug()) {
        browserLongPress(trackerEl, tracker);
    } else {
        deviceLongPress(trackerEl, tracker);
    }
}

/* ------------------------------------------------------ */
/*                        Routing                         */
/* ------------------------------------------------------ */

/**
 * @param {number=} index
 * @returns {Promise<void>}
 */
window.openTracker = async (index) => {
    dom.hide('c1');
    await router.go(states.TRACKER, {tracker: index});
};

/**
 * @returns {Promise<void>}
 */
async function debugReloadState() {
    if (!app.isDebug()) {
        return;
    }
    const params = await state.getParams();
    if (params != null && params['tracker'] != null) {
        await openTracker(params['tracker']);
        delete window.load;
    }
}

/* ------------------------------------------------------ */
/*                        Settings                        */
/* ------------------------------------------------------ */

/**
 * @returns {Promise<void>}
 */
window.openSettings = async () => {
    await appendDialog('settings');
};

/**
 * @returns {Promise<void>}
 */
window.importData = async () => {
    await backup.import();
    await toast.show('DATA_IMPORTED');
    await haptics.light();
    closeModal();
    await app.reload();
};

/**
 * @returns {Promise<void>}
 */
window.exportData = async () => {
    await backup.export();
    await toast.show('DATA_EXPORTED');
    await haptics.light();
    closeModal();
};