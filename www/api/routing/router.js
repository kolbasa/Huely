const {root} = await import('./../root.js');
const {state} = await import('./state.js');

export const router = {

    /**
     * @param {State} name
     * @param {*=} stateParams
     * @returns {Promise<void>}
     */
    go: async (name, stateParams) => {
        await state.setParams(stateParams);
        window.location.replace(root.path + name);
    }

};