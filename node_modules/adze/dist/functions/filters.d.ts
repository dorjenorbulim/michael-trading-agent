import { LevelConfiguration, LevelSelector } from '../index.js';
import Log from '../log.js';
/**
 * Normalize a level filter value to an array of log level numbers.
 */
export declare function normalizeLevelSelector(levels: Record<string, LevelConfiguration>, selector: LevelSelector): number[];
/**
 * Is the provided level filtered out?
 */
export declare function failsLevelSelector(type: 'include' | 'exclude', levels: number[], level: number): boolean;
/**
 * Allow only values that are in the include list. If no values are found in the include list,
 * the result is false.
 */
export declare function isNotIncluded(source: string[], values: string[]): boolean;
/**
 * Allow only values that are not in the exclude list. If one or more values are found in the
 * exclude list, the result is false.
 */
export declare function isExcluded(source: string[], values: string[]): boolean;
/**
 * Returns an array of Log instances that have the provided label.
 */
export declare function filterByLabel(label: string, logs: Log[]): Log[];
/**
 * Filters an array of Log instances that contain the provided namespaces.
 */
export declare function filterByNamespace(namespace: string[], logs: Log[]): Log[];
export declare function filterByLevel(level: LevelSelector, logs: Log[]): Log[];
