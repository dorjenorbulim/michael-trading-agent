import { ConsoleStyle, Configuration } from '../index.js';
import Log from '../log.js';
/**
 * Capitalizes the first character of the provided string.
 */
export declare function initialCaps(str: string): string;
/**
 * Get all of the available level numbers.
 */
export declare function allLevels(levels: Configuration['levels']): number[];
/**
 * Make a range of numbers from the start to the end.
 */
export declare function makeRange(allLevels: number[], start: number, end: number): number[];
/**
 * Add spaces to the end of a log title to make them all align.
 */
export declare function addPadding(str: string, withEmoji?: boolean, emoji?: string): string;
/**
 * Applies array of console styles to the provided string. An optional terminal color fidelity
 * value can be passed to enable different color fidelities for different terminals.
 *
 * Refer to https://github.com/alexeyraspopov/picocolors#usage
 */
export declare function applyStyles(str: string, styles: ConsoleStyle[]): string;
/**
 * Render a log from its log data.
 */
export declare function render(log: Log): void;
/**
 * Removes empty strings from a message array.
 */
export declare function cleanMessage(message: unknown[]): unknown[];
/**
 * Determines if the provided value is an object.
 */
export declare function isObject(val: unknown): boolean;
