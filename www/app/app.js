/**
 * @returns {Promise<void>}
 */
window.goHome = async () => {
    const {router} = await import('../api/routing/router.js');
    const {states} = await import('./states/states.js');
    await router.go(states.START);
};

/**
 * @type {number}
 */
const loader = setInterval(async () => {
    if (window.load == null) {
        return;
    }
    clearInterval(loader);
    try {
        const {logger} = await import('./log/logger.js');
        const {language} = await import('../api/language.js');

        await logger.watch();
        await language.update();

        await window.load(); // state logic
    } finally {
        document.body.classList.remove('hidden');
    }
}, 10);