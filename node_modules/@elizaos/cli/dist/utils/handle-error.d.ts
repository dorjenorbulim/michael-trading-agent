import { OptionValues } from 'commander';
/**
 * Handles the error by logging it and exiting the process.
 * If the error is a string, it logs the error message and exits.
 * If the error is an instance of Error, it logs the error message and exits.
 * If the error is not a string or an instance of Error,
 * it logs a default error message and exits.
 * @param {unknown} error - The error to be handled.
 */
export declare function handleError(error: unknown): void;
export declare function checkServer(opts: OptionValues): Promise<void>;
//# sourceMappingURL=handle-error.d.ts.map