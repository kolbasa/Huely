let Toast = undefined;
try {
    Toast = (await import('@capacitor/toast')).Toast;
} catch (e) {
    //
}

const {language} = await import('./../../api/language.js');

export const toast = {

    /**
     * @returns {Promise<void>}
     */
    show: async (message) => {
        message = language.translate(message);
        if (Toast == null) {
            console.log(`Toast: ${message}`);
            return;
        }
        await Toast.show({text: message});
    }

};
