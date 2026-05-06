/**
 * Validates that the log meta data contains the required fields for a JSON log.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasRequiredFields(meta) {
    return typeof meta.name === 'string' && typeof meta.hostname === 'string';
}
