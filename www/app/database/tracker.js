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
     * @type {Object.<string, [number, string?]>}
     */
    dates = {};

    /**
     * @param {string?} name
     * @param {number?} created
     * @param {Object.<string, [number, string?]>?} dates
     */
    constructor(name, created, dates) {
        this.name = name;
        this.created = created || Date.now();
        this.dates = dates == null ? {} : dates;
    }

}