import { LevelConfiguration, ModifierData } from '../_types/index.js';
import { Configuration } from '../configuration.js';
/**
 * The base class for all adze log formatters.
 */
export default abstract class Formatter {
    /**
     * The configuration for the adze log.
     */
    protected cfg: Configuration;
    /**
     * The log level configuration.
     */
    protected level: LevelConfiguration;
    /**
     * The default timestamp formatter. Override this to customize for your own formatter.
     */
    protected timestampFormatFunction: (date: Date) => string;
    constructor(cfg: Configuration, level: LevelConfiguration);
    /**
     * Returns the timestamp formatter override function or the timestamp formatter function from
     * this formatter instance.
     */
    get timestampFormatter(): (date: Date) => string;
    /**
     * Entry point to printing logs.
     */
    print(mods: ModifierData, timestamp: string, args: unknown[]): unknown[];
    /**
     * Return a string format for your logs in the browser.
     */
    protected abstract formatBrowser(data: ModifierData, timestamp: string, args: unknown[]): unknown[];
    /**
     * Return a string format for your logs in a server environment.
     */
    protected abstract formatServer(data: ModifierData, timestamp: string, args: unknown[]): unknown[];
    private failsFilters;
    /**
     * Validate that if a level filter is set the log passes the filter.
     */
    private failsLevelSelector;
    /**
     * Validate that if a namespaces filter is set the log passes the filter.
     */
    private failsNamespacesFilter;
    /**
     * Validate that if a labels filter is set the log passes the filter.
     */
    private failsLabelsFilter;
}
