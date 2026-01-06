const {dom} = await import('./../../../api/dom.js');
const {language} = await import('./../../../api/language.js');
const {log} = await import('./../modal/log.js');

let shown = false;

/**
 * @param {Array<{message: string, stack: string[]}>} _log
 * @returns {Promise<void>}
 */
async function updateErrorNotificationCount(_log) {
    dom.frameSkip('notification', () => dom.set('notification', 'count', _log.length));
}

/**
 * @param {Array<{message: string, stack: string[]}>} _log
 * @returns {Promise<void>}
 */
async function createErrorNotification(_log) {
    await dom.appendToBody(
        '/app/log/notification/error.html',
        '/app/log/notification/error.css'
    );
    window.showLog = async () => await log.show('UNEXPECTED_ERROR_OCCURRED', _log);
    await language.update();
}

/**
 * @param {Array<{message: string, stack: string[]}>} _log
 * @returns {Promise<void>}
 */
async function show(_log) {
    try {
        if (!shown) {
            await createErrorNotification(_log);
            shown = true;
        }
        await updateErrorNotificationCount(_log);
    } catch (err) {
        console.error(err);
    }
}

export const error = {show: show};