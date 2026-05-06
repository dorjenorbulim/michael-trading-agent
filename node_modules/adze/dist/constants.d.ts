import { Configuration, LevelConfiguration } from './_types/index.js';
/**
 * All valid log terminators. These are the terminators that can be called to end a log chain.
 */
export declare const terminators: readonly ["alert", "error", "warn", "info", "fail", "success", "log", "debug", "verbose", "custom", "clear", "clr", "close", "thread"];
/**
 * All valid default log levels.
 */
export declare const levels: readonly ["alert", "error", "warn", "info", "fail", "success", "log", "debug", "verbose"];
/**
 * Console methods that have alternative behaviors and take arguments and can be printed with a styled leader.
 */
export declare const specialMethodsWithArgsAndLeader: readonly ["group", "groupCollapsed"];
/**
 * Console methods that have alternative behaviors and take arguments.
 */
export declare const specialMethodsWithArgs: readonly ["dir", "dirxml", "table", "group", "groupCollapsed"];
/**
 * Methods that accept at least one argument as the first argument.
 */
export declare const methodsWithArgs: readonly ["error", "warn", "info", "log", "debug", "dir", "dirxml", "table", "group", "groupCollapsed"];
/**
 * Console methods that have alternative behaviors and do not take arguments.
 */
export declare const specialMethodsWithoutArgs: readonly ["clear", "groupEnd"];
/**
 * All uncommon standard methods.
 */
export declare const specialMethods: readonly ["dir", "dirxml", "table", "group", "groupCollapsed", "clear", "groupEnd"];
/**
 * All valid native browser methods utilized by Adze.
 */
export declare const methods: readonly ["error", "warn", "info", "log", "debug", "dir", "dirxml", "table", "group", "groupCollapsed", "clear", "groupEnd"];
/**
 * All valid log modifier names.
 */
export declare const modifiers: readonly ["assert", "count", "countClear", "countReset", "closeThread", "dir", "dirxml", "dump", "format", "group", "groupCollapsed", "groupEnd", "if", "label", "meta", "namespace", "silent", "table", "time", "timeEnd", "timeNow", "timestamp", "trace", "withEmoji"];
/**
 * All valid log formats. These determine the style that is emitted.
 */
export declare const formats: readonly ["pretty", "prettyEmoji", "json", "standard", "common", "default"];
export declare const defaultConfiguration: Configuration;
/**
 * Default log configuration for alert logs.
 */
export declare function getAlertConfig(overrides?: Partial<LevelConfiguration>): LevelConfiguration;
/**
 * Default log configuration for error logs.
 */
export declare function getErrorConfig(overrides?: Partial<LevelConfiguration>): LevelConfiguration;
/**
 * Default log configuration for warn logs.
 */
export declare function getWarnConfig(overrides?: Partial<LevelConfiguration>): LevelConfiguration;
/**
 * Default log configuration for info logs.
 */
export declare function getInfoConfig(overrides?: Partial<LevelConfiguration>): LevelConfiguration;
/**
 * Default log configuration for fail logs.
 */
export declare function getFailConfig(overrides?: Partial<LevelConfiguration>): LevelConfiguration;
/**
 * Default log configuration for success logs.
 */
export declare function getSuccessConfig(overrides?: Partial<LevelConfiguration>): LevelConfiguration;
/**
 * Default log configuration for log logs.
 */
export declare function getLogConfig(overrides?: Partial<LevelConfiguration>): LevelConfiguration;
/**
 * Default log configuration for debug logs.
 */
export declare function getDebugConfig(overrides?: Partial<LevelConfiguration>): LevelConfiguration;
/**
 * Default log configuration for verbose logs.
 */
export declare function getVerboseConfig(overrides?: Partial<LevelConfiguration>): LevelConfiguration;
