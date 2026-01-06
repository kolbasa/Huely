const {stack} = await import('./../../api/stack.js');
const {error} = await import('./notification/error.js');

/**
 * @type {number}
 */
const MAX_ENTRIES = 99;

/**
 * @type {Array<{message: string, stack: string[]}>}
 */
const log = [];

/**
 * @param {{message: string, stack: string[]}} errorToLog
 * @returns {Promise<void>}
 */
async function push(errorToLog) {
    if (log.length >= MAX_ENTRIES) {
        log.shift();
    }
    log.push(errorToLog);
    await error.show(log);
}

/**
 * @returns {Promise<void>}
 */
async function watch() {
    window.addEventListener('error', (e) => push(stack.parse(e)));
    window.addEventListener('unhandledrejection', (e) => push(stack.parse(e)));
}

export const logger = {
    watch: watch
};


