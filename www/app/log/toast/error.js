const {dom} = await import('../../../api/dom.js');
const {language} = await import('../../../api/language.js');
const {log} = await import('../modal/log.js');

let shown = false;

/**
 * @param {Array<{message: string, stack: string[]}>} _log
 * @returns {Promise<void>}
 */
const updateErrorToastCount = async (_log) => {
    dom.frameSkip('notification', () => dom.set('notification', 'count', _log.length));
};

/**
 * @param {Array<{message: string, stack: string[]}>} _log
 * @returns {Promise<void>}
 */
const createErrorToast = async (_log) => {
    await dom.appendToBody(
        '/app/log/toast/error.html',
        '/app/log/toast/error.css'
    );
    window.showLog = async () => await log.show('UNEXPECTED_ERROR_OCCURRED', _log);
    await language.update();
};

/**
 * @param {Array<{message: string, stack: string[]}>} _log
 * @returns {Promise<void>}
 */
const show = async (_log) => {
    if (!shown) {
        await createErrorToast(_log);
        shown = true;
    }
    await updateErrorToastCount(_log);
};

export const error = {show: show};