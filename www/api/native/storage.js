export const storage = {

    /**
     * @param {string} key
     * @param {string} data
     * @returns {void}
     */
    set: async (key, data) => {
        localStorage.setItem(key, data);
    },

    /**
     * @param {string} key
     * @returns {Promise<string|undefined>}
     */
    get: async (key) => {
        return localStorage.getItem(key);
    }

};
