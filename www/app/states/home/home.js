await import('../../app.js');

const {dom} = await import('../../../api/dom.js');
const {states} = await import('../../../app/states/states.js');
const {router} = await import('../../../api/routing/router.js');
const {trackers} = await import('../../database/trackers.js');
const {language} = await import('../../../api/language.js');

/* ------------------------------------------------------ */
/*                      Tracker List                      */
/* ------------------------------------------------------ */

/**
 * @returns {Promise<void>}
 */
const refreshList = async () => {
    const list = await trackers.list();
    dom.repeat('tracker', list.length, {
        id: (index) => index,
        name: (index) => {
            return list[index].name;
        }
    });
    list.forEach(addLongPressEventListener);
};

/**
 * @param {string} locale
 */
const showToast = (locale) => {
    if (window.Capacitor != null) {
        window.Capacitor.Plugins.Toast.show({text: language.translate(locale)});
    }
};

let waitingFor;

/**
 * @returns {void}
 */
const onBackButton = async () => {
    if (removeDialog != null) {
        window.closeModal();
        return;
    }

    showToast('PRESS_AGAIN_TO_EXIT');

    if (waitingFor != null) {
        return window.Capacitor.Plugins.App.exitApp()
    }

    waitingFor = setTimeout(() => {
        waitingFor = null;
    }, 1500);
};

/**
 * @returns {void}
 */
const backButtonListener = () => {
    if (window.Capacitor != null) {
        window.Capacitor.addListener('App', 'backButton', onBackButton);
    }
};

/**
 * @returns {void}
 */
const stateChangeListener = () => {
    if (window.Capacitor != null) {
        window.Capacitor.addListener('App', 'appStateChange', window.closeModal);
    }
};

/**
 * @returns {void}
 */
window.load = async () => {
    await refreshList();
    backButtonListener();
    stateChangeListener();
};

/* ------------------------------------------------------ */
/*                         Dialog                         */
/* ------------------------------------------------------ */

/**
 * @type {Tracker}
 */
let editedTracker = undefined;

/**
 * @type {function():void}
 */
let removeDialog = undefined;

/**
 * @param {string} type
 * @returns {Promise<void>}
 */
const appendDialog = async (type) => {
    await window.closeModal();
    removeDialog = await dom.appendToBody(
        `./dialog/${type}/${type}.html`,
        `./dialog/${type}/${type}.css`
    );
    await language.update();
    const dialog = dom.element('dialog');
    if (dialog['showModal'] == null) {
        return;
    }
    dialog.showModal();
};

/**
 * @param {FormData} form
 * @returns {void}
 */
const onCreate = async (form) => {
    if (form['name'] == null) {
        return;
    }
    await trackers.add(dom.sanitize(form.name));
    window.closeModal();
    await refreshList();
};

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
const onUpdate = async (form) => {
    if (form['name'] == null) {
        return;
    }
    editedTracker.name = dom.sanitize(form.name);
    await trackers.update(editedTracker);
    window.closeModal();
    await refreshList();
};

/**
 * @param {Tracker} tracker
 * @returns {Promise<void>}
 */
const updateDialog = async (tracker) => {
    await appendDialog('update');
    editedTracker = tracker;
    dom.setValue('name', tracker.name);
    dom.onFormSubmit('update', onUpdate);
};

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
    if (editedTracker != null) {
        await trackers.remove(editedTracker);
    }
    window.closeModal();
    await refreshList();
};

/**
 * @returns {void}
 */
window.closeModal = () => {
    if (removeDialog == null) {
        return;
    }
    removeDialog();
    removeDialog = undefined;
};

/* ------------------------------------------------------ */
/*                    Tracker Options                     */
/* ------------------------------------------------------ */

/**
 * @type {number}
 */
let optionsTimeoutId = undefined;


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
    optionsTimeoutId = setTimeout(async () => {
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
    if (optionsTimeoutId == null) {
        return;
    }
    clearTimeout(optionsTimeoutId);
    optionsTimeoutId = undefined;
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
    if (window.Capacitor != null) {
        deviceLongPress(trackerEl, tracker);
    } else {
        browserLongPress(trackerEl, tracker);
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
    dom.hide('c3');
    dom.show('loading');
    await router.go(states.TRACKER, {tracker: index});
};

// const {state} = await import('../../../api/routing/state.js');
// const params = await state.getParams();
// if (params != null && params['tracker'] != null) {
//     await window.openTracker(params['tracker']);
//     delete window.load;
// }