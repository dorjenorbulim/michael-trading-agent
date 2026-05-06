import { picocolors } from './picocolors-loader.js';
/**
 * Capitalizes the first character of the provided string.
 */
export function initialCaps(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * Get all of the available level numbers.
 */
export function allLevels(levels) {
    return Object.values(levels).map((level) => level.level);
}
/**
 * Make a range of numbers from the start to the end.
 */
export function makeRange(allLevels, start, end) {
    return allLevels.filter((level) => level >= start && level <= end);
}
/**
 * Add spaces to the end of a log title to make them all align.
 */
export function addPadding(str, withEmoji = false, emoji) {
    const len = withEmoji && emoji ? 9 + emoji.length : 9;
    const diff = len - str.length;
    let padded = str;
    for (let i = 0; i <= diff; i += 1) {
        padded += ' ';
    }
    return padded;
}
/**
 * Applies array of console styles to the provided string. An optional terminal color fidelity
 * value can be passed to enable different color fidelities for different terminals.
 *
 * Refer to https://github.com/alexeyraspopov/picocolors#usage
 */
export function applyStyles(str, styles) {
    // Force console colors
    return styles.reduce((acc, style) => {
        return picocolors[style](acc);
    }, str);
}
/**
 * Render a log from its log data.
 */
export function render(log) {
    if (log.data) {
        console[log.data.method](...log.data.message);
    }
}
/**
 * Removes empty strings from a message array.
 */
export function cleanMessage(message) {
    return message.filter((msg) => msg !== '');
}
/**
 * Determines if the provided value is an object.
 */
export function isObject(val) {
    return typeof val === 'object' && val !== null;
}
