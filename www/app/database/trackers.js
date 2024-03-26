const {Tracker} = await import('./tracker.js');
const {storage} = await import('../../api/native/storage.js');

/**
 * @type {string}
 */
const STORAGE_KEY = 'trackers';

/**
 * @param {Array<Tracker>} trackers
 * @returns {Promise<void>}
 */
const serialize = async (trackers) => {
    trackers = trackers.sort((a, b) => a.name.localeCompare(b.name));
    await storage.set(STORAGE_KEY, JSON.stringify(trackers));
};

/**
 * @returns {Promise<Array<Tracker>>}
 */
const deserialize = async () => {
    const entries = await storage.get(STORAGE_KEY);
    let trackers = (typeof entries === 'string') ? JSON.parse(entries) : [];
    return trackers.map((tracker) => {
        return new Tracker(tracker);
    });
};

/**
 * @param {string} name
 * @param {string} name
 * @returns {Promise<Array<Tracker>>}
 */
const add = async (name) => {
    const trackers = await deserialize();
    if (trackers.find(entry => entry.name === name) != null) {
        return trackers;
    }
    trackers.push(new Tracker(name));
    await serialize(trackers);
    return trackers;
};

/**
 * @param {Tracker} tracker
 * @returns {Promise<Array<Tracker>>}
 */
const update = async (tracker) => {
    let trackers = await remove(tracker);
    trackers.push(tracker);
    await serialize(trackers);
    return trackers;
};

/**
 * @param {Tracker} tracker
 * @returns {Promise<Array<Tracker>>}
 */
const remove = async (tracker) => {
    let trackers = await deserialize();
    trackers = trackers.filter(entry => entry.created !== tracker.created);
    await serialize(trackers);
    return trackers;
};

export const trackers = {
    list: deserialize,
    add: add,
    update: update,
    remove: remove
};