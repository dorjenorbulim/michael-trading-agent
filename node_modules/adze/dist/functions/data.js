import { envIsWindow } from './global.js';
import { isNumber } from './type-guards.js';
/**
 * Generates a stacktrace and returns it.
 */
export function stacktrace() {
    return Error().stack?.replace(/^Error\n/, '\n');
}
/**
 * Gets a URLSearchParams object of the current URL.
 */
export function getSearchParams() {
    const ctxt = globalThis;
    if (envIsWindow(ctxt)) {
        return new URLSearchParams(ctxt.location.search.substring(1));
    }
}
/**
 * Returns the active level number from the provided level identifier.
 */
export function getActiveLevel(cfg) {
    if (isNumber(cfg.activeLevel))
        return cfg.activeLevel;
    return cfg.levels[cfg.activeLevel].level;
}
/**
 * Adds a leading zero to a number if it is less than 10.
 */
export function leadingZero(num) {
    return (num < 10 ? '0' : '') + `${num}`;
}
