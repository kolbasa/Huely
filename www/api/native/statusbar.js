let StatusBar, Animation;
try {
    const module = await import('@capacitor/status-bar');
    StatusBar = module.StatusBar;
    Animation = module.Animation;
} catch (e) {
    //
}

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
