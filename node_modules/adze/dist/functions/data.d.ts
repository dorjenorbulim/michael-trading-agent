import { Configuration } from '../configuration.js';
/**
 * Generates a stacktrace and returns it.
 */
export declare function stacktrace(): string | undefined;
/**
 * Gets a URLSearchParams object of the current URL.
 */
export declare function getSearchParams(): URLSearchParams | undefined;
/**
 * Returns the active level number from the provided level identifier.
 */
export declare function getActiveLevel(cfg: Configuration): number;
/**
 * Adds a leading zero to a number if it is less than 10.
 */
export declare function leadingZero(num: number): string;
