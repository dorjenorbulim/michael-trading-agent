import type { HrTime } from '../_types/index.js';
/**
 * Takes an HrTime tuple and converts it into a human-readable formatted
 * string in the format of `{sec}s {ms}ms`.
 */
export declare function formatTime([sec, nano]: HrTime): string;
/**
 * Generates the current execution time.
 */
export declare function captureTimeNow(): string;
/**
 * Browser implementation of the node hrtime function for recording elapsed time.
 */
export declare function hrtime(prev?: [number, number]): [number, number];
/**
 * Generates an ISO-8601 formatted string with timezone offset.
 */
export declare function dateFormatISO(date: Date): string;
/**
 * Generates a timestamp in the common log format (`'dd/MMM/yyyy:HH:mm:ss xx'`).
 */
export declare function dateFormatCommon(date: Date): string;
