import { LevelSelector, Method, MethodWithArgs, MethodWithoutArgs, SpecialMethod } from '../_types/index.js';
/**
 * Type guard to validate that the value is a string.
 */
export declare function isString(value: unknown): value is string;
/**
 * Type guard that validates that an object contains all of the specified properties.
 */
export declare function hasOwnProperties<X extends Record<any, unknown>, Y extends PropertyKey, A extends Y[]>(obj: X, props: A): obj is X & Record<Y, unknown>;
/**
 * Type Guard to validate that the value is a number.
 */
export declare function isNumber(value: unknown): value is number;
/**
 * Type guard to determine if a console method is a common method.
 */
export declare function isMethodWithArgs(value: Method): value is MethodWithArgs;
/**
 * Type guard to determine if a console method is a common method.
 */
export declare function isMethodWithoutArgs(value: Method): value is MethodWithoutArgs;
/**
 * Type guard to determine if a console method is a special method.
 */
export declare function isSpecialMethod(value: Method): value is SpecialMethod;
/**
 * Type guard to determine if a console method is a special method with a leader.
 */
export declare function isSpecialMethodWithLeader(value: Method): value is SpecialMethod;
/**
 * Type guard to determine if the value is an array of strings.
 */
export declare function isStringArray(value: unknown[]): value is string[];
/**
 * Type guard to determine if the value is a range tuple.
 */
export declare function isRange(value: LevelSelector): value is [string, '-', string] | [number, '-', number];
/**
 * Validate that a log namespace is allowed.
 */
export declare function isNamespaceAllowed<N extends string[] = string[]>(allowed: string[], ns: string): ns is N[number];
