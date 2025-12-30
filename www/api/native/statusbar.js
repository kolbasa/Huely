import {StatusBar, Animation} from '@capacitor/status-bar';

export const statusbar = {

    /**
     * @returns {Promise<void>}
     */
    hide: async () => {
        try {
            await StatusBar.hide({animation: Animation.None});
        } catch (err) {
            //
        }
    }

};
