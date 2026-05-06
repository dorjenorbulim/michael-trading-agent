import { filterByLabel, filterByLevel, filterByNamespace, render } from './functions/index.js';
export default class Tools {
    /**
     * Reference to the global store.
     */
    globalStore;
    constructor(globalStore) {
        this.globalStore = globalStore;
    }
    /**
     * Clears the console.
     */
    clear() {
        console.clear();
    }
    /**
     * Rerenders all logs that match the label filter.
     */
    filterByLabel(label) {
        const logs = filterByLabel(label, this.globalStore.cache);
        logs.forEach((log) => {
            render(log);
        });
    }
    /**
     * Rerenders all logs that match the namespace filter.
     */
    filterByNamespace(...namespace) {
        const logs = filterByNamespace(namespace, this.globalStore.cache);
        logs.forEach((log) => {
            render(log);
        });
    }
    /**
     * Rerenders all logs that match the level selector.
     */
    filterByLevel(level) {
        const logs = filterByLevel(level, this.globalStore.cache);
        logs.forEach((log) => {
            render(log);
        });
    }
    /**
     * Rerenders all logs that have been cached.
     */
    renderAll() {
        this.globalStore.cache.forEach((log) => {
            render(log);
        });
    }
}
