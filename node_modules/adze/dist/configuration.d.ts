import { Filters, FormatterConstructor, Configuration as IConfiguration, Level, LevelConfiguration, TimestampFormatter, UserConfiguration } from './_types/index.js';
import { Middleware } from './middleware.js';
/**
 * This class is a proxy for getting configuration in the correct hierarchical order.
 */
export declare class Configuration implements IConfiguration {
    /**
     * The log defined configuration.
     */
    private logCfg;
    /**
     * Reference to the global store configuration overrides.
     */
    private glblCfg?;
    constructor(logCfg?: UserConfiguration);
    updateConfiguration(cfg: UserConfiguration): void;
    get activeLevel(): Level | number;
    set activeLevel(level: Level | number);
    set autoSerialize(value: boolean);
    get autoSerialize(): boolean;
    get cache(): boolean;
    set cache(value: boolean);
    get cacheSize(): number;
    set cacheSize(size: number);
    set customReplacer(value: (key: string, value: unknown) => unknown);
    get customReplacer(): ((key: string, value: unknown) => unknown) | undefined;
    get dump(): boolean;
    set dump(value: boolean);
    get meta(): Record<string, unknown>;
    set meta(value: Record<string, unknown>);
    get silent(): boolean;
    set silent(value: boolean);
    get showTimestamp(): boolean;
    set showTimestamp(value: boolean);
    get withEmoji(): boolean;
    set withEmoji(value: boolean);
    get format(): string;
    set format(value: string);
    get levels(): Record<string, LevelConfiguration>;
    set levels(value: Record<string, LevelConfiguration>);
    get middleware(): Middleware[] | undefined;
    set middleware(value: Middleware[] | undefined);
    get filters(): Filters | undefined;
    set filters(value: Filters | undefined);
    get timestampFormatter(): TimestampFormatter | undefined;
    set timestampFormatter(value: TimestampFormatter | undefined);
    get formatters(): Record<string, FormatterConstructor>;
    set formatters(value: Record<string, FormatterConstructor>);
    exportValues(): UserConfiguration;
}
