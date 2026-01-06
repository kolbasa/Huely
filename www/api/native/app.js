let App;
try {
    App = (await import('@capacitor/app')).App;
} catch (e) {
    //
}

export const app = {

    /**
     * @returns {Promise<void>}
     */
    exit: async () => {
        if (App == null) {
            return;
        }
        await App.exitApp();
    },

    /**
     * @returns {Promise<void>}
     */
    reload: async () => {
        location.reload();
    },

    /**
     * @param {function} fn
     * @returns {Promise<void>}
     */
    backButtonListener: async (fn) => {
        if (App == null) {
            return;
        }
        await App.addListener('backButton', fn);
    },

    /**
     * @param {function} fn
     * @returns {Promise<void>}
     */
    stateChangeListener: async (fn) => {
        if (App == null) {
            return;
        }
        await App.addListener('appStateChange', fn);
    },

    /**
     * @returns {boolean}
     */
    isDesktop: () => {
        if (App == null) {
            return true;
        }
        return window.Capacitor.getPlatform() === 'web';
    }

};
