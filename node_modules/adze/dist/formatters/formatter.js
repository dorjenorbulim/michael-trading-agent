import { dateFormatISO, getActiveLevel, isBrowser, isMethodWithArgs, isSpecialMethod, isSpecialMethodWithLeader, } from '../functions/index.js';
import { failsLevelSelector, normalizeLevelSelector, isNotIncluded, isExcluded, } from '../functions/filters.js';
/**
 * The base class for all adze log formatters.
 */
export default class Formatter {
    /**
     * The configuration for the adze log.
     */
    cfg;
    /**
     * The log level configuration.
     */
    level;
    /**
     * The default timestamp formatter. Override this to customize for your own formatter.
     */
    timestampFormatFunction = (date) => dateFormatISO(date);
    constructor(cfg, level) {
        this.cfg = cfg;
        this.level = level;
    }
    /**
     * Returns the timestamp formatter override function or the timestamp formatter function from
     * this formatter instance.
     */
    get timestampFormatter() {
        return this.cfg.timestampFormatter ? this.cfg.timestampFormatter : this.timestampFormatFunction;
    }
    /**
     * Entry point to printing logs.
     */
    print(mods, timestamp, args) {
        // Do not print the log if its log level is higher than the active level.
        if (this.level.level > getActiveLevel(this.cfg))
            return [];
        if (this.failsFilters(mods))
            return [];
        if (mods.assertion === true)
            return [];
        if (mods.if === false)
            return [];
        if (mods.method && !isSpecialMethodWithLeader(mods.method)) {
            if (isSpecialMethod(mods.method) && isMethodWithArgs(mods.method))
                return args;
        }
        // Select the appropriate formatter method on the environment.
        const message = isBrowser()
            ? this.formatBrowser(mods, timestamp, args)
            : this.formatServer(mods, timestamp, args);
        if (mods.stacktrace)
            message.push(mods.stacktrace);
        return message;
    }
    failsFilters(mods) {
        if (this.failsLevelSelector())
            return true;
        if (this.failsNamespacesFilter(mods))
            return true;
        if (this.failsLabelsFilter(mods))
            return true;
        return false;
    }
    /**
     * Validate that if a level filter is set the log passes the filter.
     */
    failsLevelSelector() {
        if (this.cfg.filters?.levels === undefined)
            return false;
        const normalizedLevelSelector = normalizeLevelSelector(this.cfg.levels, this.cfg.filters.levels.values);
        if (failsLevelSelector(this.cfg.filters.levels.type, normalizedLevelSelector, this.level.level))
            return true;
        return false;
    }
    /**
     * Validate that if a namespaces filter is set the log passes the filter.
     */
    failsNamespacesFilter(mods) {
        if (this.cfg.filters?.namespaces === undefined)
            return false;
        if (this.cfg.filters.namespaces.values.length > 0 && mods.namespace === undefined)
            return true;
        if (this.cfg.filters.namespaces.type === 'include') {
            const namespaces = mods.namespace ?? [];
            return isNotIncluded(this.cfg.filters.namespaces.values, namespaces);
        }
        const namespaces = mods.namespace ?? [];
        return isExcluded(this.cfg.filters.namespaces.values, namespaces);
    }
    /**
     * Validate that if a labels filter is set the log passes the filter.
     */
    failsLabelsFilter(mods) {
        if (this.cfg.filters?.labels === undefined)
            return false;
        if (this.cfg.filters.labels.values.length > 0 && mods.label === undefined)
            return true;
        const label = mods.label ? [mods.label.name] : [];
        if (this.cfg.filters.labels.type === 'include') {
            return isNotIncluded(this.cfg.filters.labels.values, label);
        }
        return isExcluded(this.cfg.filters.labels.values, label);
    }
}
