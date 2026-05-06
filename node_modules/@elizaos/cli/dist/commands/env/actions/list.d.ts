import { ListEnvOptions } from '../types';
/**
 * Displays system information and lists local environment variables, masking sensitive values.
 *
 * Prints details about the current platform, architecture, CLI version, and package manager. Shows environment variables from the project's `.env` file, masking sensitive values, or provides guidance if the file is missing. Includes a link to the web UI for editing variables.
 */
export declare function listEnvVars(): Promise<void>;
/**
 * Handle the list command with options
 */
export declare function handleListCommand(options: ListEnvOptions): Promise<void>;
//# sourceMappingURL=list.d.ts.map