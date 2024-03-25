const {storage} = await import('./../native/storage.js');

const STORAGE_KEY = 'state_params';

export const state = {

    /**
     * @param {*=} stateParams
     * @returns {Promise<void>}
     */
    setParams: async (stateParams) => {
        let sParams = stateParams == null ? null : JSON.stringify(stateParams);
        await storage.set(STORAGE_KEY, sParams);
    },

    /**
     * @returns {Promise<*>}
     */
    getParams: async () => {
        const params = await storage.get(STORAGE_KEY);
        if (params != null) {
            return JSON.parse(params);
        }
    }

};