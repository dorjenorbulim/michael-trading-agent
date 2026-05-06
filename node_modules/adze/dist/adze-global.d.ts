import { Label, LevelSelector, LogListener, UserConfiguration } from './_types/index.js';
import Log from './log.js';
import Tools from './tools.js';
export default class AdzeGlobal<Meta extends Record<string, unknown> = Record<string, unknown>> {
    /**
     * Global Adze configuration overrides.
     */
    private config;
    /**
     * Incrementing ID counter for identifying logs.
     */
    private pidCounter;
    /**
     * All log labels.
     */
    private labels;
    /**
     * Counter for incrementing listener IDs.
     */
    private _listenerCounter;
    /**
     * Map of log levels to log listeners
     */
    private _levelsToListeners;
    /**
     * Cache of logs that have been terminated.
     */
    private _cache;
    constructor(configuration?: UserConfiguration<Meta>);
    /**
     * Returns the cache of logs that have been terminated.
     */
    get cache(): Log[];
    /**
     * Get the global Adze configuration overrides.
     */
    get configuration(): UserConfiguration;
    /**
     * Get the next process ID.
     */
    get pid(): number;
    /**
     * Tools for rerendering and filtering cached logs.
     */
    get tools(): Tools;
    /**
     * Adds a log to the log cache.
     */
    addLogToCache(log: Log): void;
    /**
     * Clears the log cache.
     */
    clearCache(): void;
    /**
     * Get a label by name.
     */
    getLabel(name: string): Label | undefined;
    /**
     * Sets a new label or overwrites an existing one.
     */
    setLabel(name: string, label: Label): void;
    /**
     * Adds a log listener that will be called after a log has been terminated.
     */
    addListener(levels: LevelSelector, listener: LogListener): number;
    /**
     * Removes a log listener by its ID.
     */
    removeListener(id: number): void;
    /**
     * Returns an array of log listener callback functions.
     */
    getListeners(level: number): LogListener[];
}
