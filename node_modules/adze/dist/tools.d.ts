import { LevelSelector } from './index.js';
import AdzeGlobal from './adze-global.js';
export default class Tools {
    /**
     * Reference to the global store.
     */
    private globalStore;
    constructor(globalStore: AdzeGlobal);
    /**
     * Clears the console.
     */
    clear(): void;
    /**
     * Rerenders all logs that match the label filter.
     */
    filterByLabel(label: string): void;
    /**
     * Rerenders all logs that match the namespace filter.
     */
    filterByNamespace(...namespace: string[]): void;
    /**
     * Rerenders all logs that match the level selector.
     */
    filterByLevel(level: LevelSelector): void;
    /**
     * Rerenders all logs that have been cached.
     */
    renderAll(): void;
}
