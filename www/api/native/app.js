import {App} from '@capacitor/app';

export const app = {

    /**
     * @returns {Promise<void>}
     */
    exit: async () => {
        await App.exitApp()
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
        await App.addListener('backButton', fn);
    },

    /**
     * @param {function} fn
     * @returns {Promise<void>}
     */
    stateChangeListener: async (fn) => {
        await App.addListener('appStateChange', fn);
    },


    /**
     * @returns {boolean}
     */
    isDebug: () => {
        return window.Capacitor.getPlatform() === 'web'
    }

};
