const {state} = await import('./state.js');

export const router = {

    /**
     * @param {State} sState
     * @param {*=} stateParams
     * @returns {Promise<void>}
     */
    go: async (sState, stateParams) => {
        await state.setParams(stateParams);
        window.location.replace(sState);
    }

};