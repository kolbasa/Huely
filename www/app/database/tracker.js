export class Tracker {

    /**
     * @type {string}
     */
    name;

    /**
     * @type {number}
     */
    created;

    /**
     * @type {Object.<string, number>}
     */
    dates = {};

    /**
     * @param {string|object} o
     */
    constructor(o) {
        if (typeof o === 'object') {
            for (let key in o) {
                if (this.hasOwnProperty(key)) {
                    this[key] = o[key];
                }
            }
            return;
        }
        this.name = o;
        this.created = Date.now();
    }

}