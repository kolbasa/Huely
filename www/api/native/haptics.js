let Haptics, ImpactStyle;
try {
    const haptics = await import('@capacitor/haptics');
    Haptics = haptics.Haptics;
    ImpactStyle = haptics.ImpactStyle;
} catch (e) {
    //
}

export const haptics = {

    /**
     * @returns {Promise<void>}
     */
    light: async () => {
        if (Haptics == null) {
            return;
        }
        await Haptics.impact({style: ImpactStyle.Light});
    }

};
