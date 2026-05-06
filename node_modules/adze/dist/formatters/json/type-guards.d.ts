import { JsonLogRequiredFields } from './types.js';
/**
 * Validates that the log meta data contains the required fields for a JSON log.
 */
export declare function hasRequiredFields(meta: Record<string, any>): meta is JsonLogRequiredFields;
