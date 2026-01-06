import {Toast} from '@capacitor/toast';
const {app} = await import('../../api/native/app.js');
const {language} = await import('../../api/language.js');

export const toast = {

    /**
     * @returns {Promise<void>}
     */
    show: async (message) => {
        message = language.translate(message);
        if (app.isDesktop()) {
            console.log(`Toast: ${message}`);
        }
        await Toast.show({text: message});
    }

};
