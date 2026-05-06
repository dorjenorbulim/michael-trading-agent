import { defaultConfiguration as dfltCfg } from './constants.js';
/**
 * This class is a proxy for getting configuration in the correct hierarchical order.
 */
export class Configuration {
    /**
     * The log defined configuration.
     */
    logCfg;
    /**
     * Reference to the global store configuration overrides.
     */
    glblCfg;
    constructor(logCfg) {
        this.logCfg = logCfg ?? {};
        this.glblCfg = globalThis.$adzeGlobal?.configuration;
    }
    updateConfiguration(cfg) {
        this.logCfg = cfg;
    }
    get activeLevel() {
        return this.glblCfg?.activeLevel ?? this.logCfg.activeLevel ?? dfltCfg.activeLevel;
    }
    set activeLevel(level) {
        this.logCfg.activeLevel = level;
    }
    set autoSerialize(value) {
        this.logCfg.autoSerialize = value;
    }
    get autoSerialize() {
        return this.glblCfg?.autoSerialize ?? this.logCfg.autoSerialize ?? dfltCfg.autoSerialize;
    }
    get cache() {
        return this.glblCfg?.cache ?? this.logCfg.cache ?? dfltCfg.cache;
    }
    set cache(value) {
        this.logCfg.cache = value;
    }
    get cacheSize() {
        return this.glblCfg?.cacheSize ?? this.logCfg.cacheSize ?? dfltCfg.cacheSize;
    }
    set cacheSize(size) {
        this.logCfg.cacheSize = size;
    }
    set customReplacer(value) {
        this.logCfg.customReplacer = value;
    }
    get customReplacer() {
        return this.glblCfg?.customReplacer ?? this.logCfg.customReplacer;
    }
    get dump() {
        return this.glblCfg?.dump ?? this.logCfg.dump ?? dfltCfg.dump;
    }
    set dump(value) {
        this.logCfg.dump = value;
    }
    get meta() {
        return { ...this.logCfg.meta, ...this.glblCfg?.meta };
    }
    set meta(value) {
        this.logCfg.meta = value;
    }
    get silent() {
        return this.glblCfg?.silent ?? this.logCfg.silent ?? dfltCfg.silent;
    }
    set silent(value) {
        this.logCfg.silent = value;
    }
    get showTimestamp() {
        return this.glblCfg?.showTimestamp ?? this.logCfg.showTimestamp ?? dfltCfg.showTimestamp;
    }
    set showTimestamp(value) {
        this.logCfg.showTimestamp = value;
    }
    get withEmoji() {
        return this.glblCfg?.withEmoji ?? this.logCfg.withEmoji ?? dfltCfg.withEmoji;
    }
    set withEmoji(value) {
        this.logCfg.withEmoji = value;
    }
    get format() {
        return this.glblCfg?.format ?? this.logCfg.format ?? dfltCfg.format;
    }
    set format(value) {
        this.logCfg.format = value;
    }
    get levels() {
        return { ...dfltCfg.levels, ...(this.logCfg.levels ?? {}), ...(this.glblCfg?.levels ?? {}) };
    }
    set levels(value) {
        this.logCfg.levels = value;
    }
    get middleware() {
        return [...(this.glblCfg?.middleware ?? []), ...(this.logCfg.middleware ?? [])];
    }
    set middleware(value) {
        this.logCfg.middleware = value;
    }
    get filters() {
        return this.glblCfg?.filters ?? this.logCfg.filters;
    }
    set filters(value) {
        this.logCfg.filters = value;
    }
    get timestampFormatter() {
        return this.glblCfg?.timestampFormatter ?? this.logCfg.timestampFormatter;
    }
    set timestampFormatter(value) {
        this.logCfg.timestampFormatter = value;
    }
    get formatters() {
        return {
            ...dfltCfg.formatters,
            ...(this.logCfg.formatters ?? {}),
            ...(this.glblCfg?.formatters ?? {}),
        };
    }
    set formatters(value) {
        this.logCfg.formatters = value;
    }
    exportValues() {
        return {
            activeLevel: this.logCfg.activeLevel,
            cache: this.logCfg.cache,
            cacheSize: this.logCfg.cacheSize,
            dump: this.logCfg.dump,
            meta: this.logCfg.meta,
            silent: this.logCfg.silent,
            showTimestamp: this.logCfg.showTimestamp,
            withEmoji: this.logCfg.withEmoji,
            format: this.logCfg.format,
            levels: this.logCfg.levels,
            middleware: this.logCfg.middleware,
            filters: this.logCfg.filters,
            timestampFormatter: this.logCfg.timestampFormatter,
            formatters: this.logCfg.formatters,
        };
    }
}
