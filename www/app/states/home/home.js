await import('../../app.js');

const {app} = await import('../../../api/native/app.js');
const {dom} = await import('../../../api/dom.js');
const {exit} = await import('../../../api/exit.js');
const {modal} = await import('../../../api/modal.js');
const {touch} = await import('../../../api/touch.js');
const {toast} = await import('../../../api/native/toast.js');
const {state} = await import('../../../api/routing/state.js');
const {states} = await import('../../../app/states/states.js');
const {router} = await import('../../../api/routing/router.js');
const {backup} = await import('../../database/import-export.js');
const {haptics} = await import('../../../api/native/haptics.js');
const {trackers} = await import('../../database/trackers.js');
const {statusbar} = await import('../../../api/native/statusbar.js');

/* ------------------------------------------------------ */
/*                      Tracker List                      */
/* ------------------------------------------------------ */

/**
 * @returns {Promise<void>}
 */
async function refreshList() {
    await modal.close();
    const list = await trackers.list();
    dom.repeat('tracker', list.length, {
        id: (index) => index, name: (index) => list[index].name
    });
    list.forEach((tracker, index) => {
        touch.onLongPress(`t${index}`, () => updateDialog(tracker));
    });
}

/* ------------------------------------------------------ */
/*                         Dialog                         */
/* ------------------------------------------------------ */

/**
 * @param {Tracker} tracker
 * @returns {Promise<void>}
 */
async function updateDialog(tracker) {
    await modal.show('./dialog/update/');
    window.tracker = tracker;
    dom.setValue('name', tracker.name);
    dom.onFormSubmit('update', async (form) => {
        tracker.name = dom.sanitize(form.name);
        await trackers.update(tracker);
        await refreshList();
    });
}

/**
 * @returns {Promise<void>}
 */
window.createDialog = async () => {
    await modal.show('./dialog/create/');
    setTimeout(() => dom.focus('name'), 50);
    dom.onFormSubmit('create', async (form) => {
        await trackers.add(dom.sanitize(form.name));
        await refreshList();
    });
};

/**
 * @returns {Promise<void>}
 */
window.deleteDialog = async () => {
    await modal.show('./dialog/delete/');
    await new Promise(resolve => setTimeout(resolve, 50));
    dom.show('dialog');
};

/**
 * @returns {Promise<void>}
 */
window.deleteTracker = async () => {
    await trackers.remove(window.tracker);
    delete window.tracker;
    await refreshList();
};

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
 * Only for desktop/debug use.
 *
 * @returns {Promise<void>}
 */
async function reloadState() {
    if (!app.isDesktop()) {
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
    await modal.show('./dialog/settings/');
};

/**
 * @returns {Promise<void>}
 */
window.importData = async () => {
    await backup.import();
    await toast.show('DATA_IMPORTED');
    await haptics.light();
    await app.reload();
};

/**
 * @returns {Promise<void>}
 */
window.exportData = async () => {
    await backup.export();
    await toast.show('DATA_EXPORTED');
    await haptics.light();
    await modal.close();
};

/* ------------------------------------------------------ */
/*                         Setup                          */
/* ------------------------------------------------------ */

/**
 * @returns {void}
 */
window.load = async () => {
    await refreshList();
    await exit.onDoubleBackButton();
    await app.stateChangeListener(modal.close);
    await statusbar.hide();
    await reloadState();
};