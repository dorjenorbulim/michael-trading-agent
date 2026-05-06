/**
 * Formats an array of namespace values into a display string for printing.
 */
export function formatNamespace(ns) {
    if (ns && ns.length > 0) {
        return ns.reduce((acc, name) => `${acc}#${name} `, '');
    }
    return '';
}
/**
 * Formats label text for printing.
 */
export function formatLabel(lbl) {
    return lbl ? `[${lbl.name}] ` : '';
}
/**
 * Formats the log count for printing.
 */
export function formatCount(count) {
    return count !== undefined ? `(Count: ${count}) ` : '';
}
/**
 * Formats the assertion result for printing.
 */
export function formatAssert(expression, withEmoji) {
    return expression !== undefined && !expression
        ? `${withEmoji ? '❌ ' : ''}Assertion failed:`
        : '';
}
/**
 * Formats the if statement result for printing.
 */
export function formatIf(expression, withEmoji) {
    return expression !== undefined && expression
        ? `${withEmoji ? '✅ ' : ''}Expression passed:`
        : '';
}
