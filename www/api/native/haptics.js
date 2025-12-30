import {Haptics, ImpactStyle} from '@capacitor/haptics';

export const haptics = {

    /**
     * @returns {Promise<void>}
     */
    light: async () => {
        await Haptics.impact({style: ImpactStyle.Light});
    }

};
