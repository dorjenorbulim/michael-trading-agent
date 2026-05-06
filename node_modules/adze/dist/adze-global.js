import { defaultConfiguration } from './constants.js';
import { normalizeLevelSelector } from './functions/index.js';
import Tools from './tools.js';
export default class AdzeGlobal {
    /**
     * Global Adze configuration overrides.
     */
    config;
    /**
     * Incrementing ID counter for identifying logs.
     */
    pidCounter = 1;
    /**
     * All log labels.
     */
    labels = new Map();
    /**
     * Counter for incrementing listener IDs.
     */
    _listenerCounter = 0;
    /**
     * Map of log levels to log listeners
     */
    _levelsToListeners = new Map();
    /**
     * Cache of logs that have been terminated.
     */
    _cache = [];
    constructor(configuration = {}) {
        this.config = configuration;
    }
    /**
     * Returns the cache of logs that have been terminated.
     */
    get cache() {
        return this._cache;
    }
    /**
     * Get the global Adze configuration overrides.
     */
    get configuration() {
        return this.config;
    }
    /**
     * Get the next process ID.
     */
    get pid() {
        const current = this.pidCounter;
        this.pidCounter++;
        return current;
    }
    /**
     * Tools for rerendering and filtering cached logs.
     */
    get tools() {
        return new Tools(this);
    }
    /**
     * Adds a log to the log cache.
     */
    addLogToCache(log) {
        if (this._cache.length < (this.config.cacheSize ?? 300)) {
            this._cache.push(log);
        }
    }
    /**
     * Clears the log cache.
     */
    clearCache() {
        this._cache = [];
    }
    /**
     * Get a label by name.
     */
    getLabel(name) {
        return this.labels.get(name);
    }
    /**
     * Sets a new label or overwrites an existing one.
     */
    setLabel(name, label) {
        this.labels.set(name, label);
    }
    /**
     * Adds a log listener that will be called after a log has been terminated.
     */
    addListener(levels, listener) {
        const id = (this._listenerCounter += 1);
        const normalizedLevels = normalizeLevelSelector({ ...defaultConfiguration.levels, ...(this.config.levels ?? {}) }, levels);
        normalizedLevels.forEach((level) => {
            if (this._levelsToListeners.has(level)) {
                const levelContainer = this._levelsToListeners.get(level);
                levelContainer.set(id, listener);
            }
            else {
                this._levelsToListeners.set(level, new Map([[id, listener]]));
            }
        });
        return id;
    }
    /**
     * Removes a log listener by its ID.
     */
    removeListener(id) {
        this._levelsToListeners.forEach((levelContainer) => {
            levelContainer.delete(id);
        });
    }
    /**
     * Returns an array of log listener callback functions.
     */
    getListeners(level) {
        return Array.from(this._levelsToListeners.get(level)?.values() ?? []);
    }
}
