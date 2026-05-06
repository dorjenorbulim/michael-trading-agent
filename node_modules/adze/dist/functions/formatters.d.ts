import { Label } from '../_types/index.js';
/**
 * Formats an array of namespace values into a display string for printing.
 */
export declare function formatNamespace(ns?: string[]): string;
/**
 * Formats label text for printing.
 */
export declare function formatLabel(lbl?: Label): string;
/**
 * Formats the log count for printing.
 */
export declare function formatCount(count?: number): string;
/**
 * Formats the assertion result for printing.
 */
export declare function formatAssert(expression?: boolean, withEmoji?: boolean): string;
/**
 * Formats the if statement result for printing.
 */
export declare function formatIf(expression?: boolean, withEmoji?: boolean): string;
