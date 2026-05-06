import { methodsWithArgs, specialMethods, specialMethodsWithArgsAndLeader, specialMethodsWithoutArgs, } from '../constants.js';
/**
 * Type guard to validate that the value is a string.
 */
export function isString(value) {
    return Object.prototype.toString.call(value) === '[object String]';
}
/**
 * Type guard that validates that an object contains all of the specified properties.
 */
export function hasOwnProperties(obj, props) {
    return !props.map((prop) => obj[prop] !== undefined).includes(false);
}
/**
 * Type Guard to validate that the value is a number.
 */
export function isNumber(value) {
    // Number(null) returns 0 😭
    return value !== null && typeof value === 'number' && !isNaN(Number(value));
}
/**
 * Type guard to determine if a console method is a common method.
 */
export function isMethodWithArgs(value) {
    return methodsWithArgs.includes(value);
}
/**
 * Type guard to determine if a console method is a common method.
 */
export function isMethodWithoutArgs(value) {
    return specialMethodsWithoutArgs.includes(value);
}
/**
 * Type guard to determine if a console method is a special method.
 */
export function isSpecialMethod(value) {
    return specialMethods.includes(value);
}
/**
 * Type guard to determine if a console method is a special method with a leader.
 */
export function isSpecialMethodWithLeader(value) {
    return specialMethodsWithArgsAndLeader.includes(value);
}
/**
 * Type guard to determine if the value is an array of strings.
 */
export function isStringArray(value) {
    return value.every((v) => isString(v));
}
/**
 * Type guard to determine if the value is a range tuple.
 */
export function isRange(value) {
    return Array.isArray(value) && value.length === 3 && value[1] === '-';
}
/**
 * Validate that a log namespace is allowed.
 */
export function isNamespaceAllowed(allowed, ns) {
    if (Array.isArray(allowed)) {
        return allowed.includes(ns);
    }
    return false;
}
