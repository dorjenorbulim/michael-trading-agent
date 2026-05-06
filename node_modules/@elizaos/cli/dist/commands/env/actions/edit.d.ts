import { EditEnvOptions } from '../types';
/**
 * Interactive environment variable editor for local .env files.
 *
 * Provides an interactive menu to edit existing variables, add new variables, and delete variables from the local .env file. Supports auto-confirmation mode for non-interactive usage.
 *
 * @param options - Edit command options
 * @param fromMainMenu - Whether this command was called from the main menu (affects return behavior)
 * @returns Promise<boolean> - Whether to return to main menu
 */
export declare function editEnvVars(options: EditEnvOptions, fromMainMenu?: boolean): Promise<boolean>;
//# sourceMappingURL=edit.d.ts.map