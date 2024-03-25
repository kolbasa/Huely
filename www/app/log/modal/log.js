const {dom} = await import('../../../api/dom.js');
const {language} = await import('../../../api/language.js');

const NL = '<br/>';
const TAB = '&emsp;&emsp;';

/**
 * @param {Array<{message: string, stack: string[]}>} log
 * @returns {string}
 */
const format = (log) => {
    const entries = log.reverse().map((entry) => {
        const _stack = entry.stack.map((line) => {
            return `${TAB}${dom.sanitize(line)}`;
        });
        return `${dom.sanitize(entry.message)}${NL}${_stack.join(NL)}`;
    });
    return entries.join(NL + NL);
};

/**
 * @param {string} title
 * @param {Array<{message: string, stack: string[]}>} log
 * @returns {Promise<void>}
 */
const show = async (title, log) => {
    const detach = await dom.appendToBody(
        '/app/log/modal/log.html',
        '/app/log/modal/log.css'
    );

    dom.set('log-header', 'title', title);
    await language.update();

    dom.set('log-text', 'log', format(log));
    dom.show('log-modal');

    window.onClose = () => {
        detach();
        delete window.close;
    };
};

export const log = {show: show};