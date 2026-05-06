/**
 * Check if bun is available on the system
 */
export declare function isBunAvailable(): Promise<boolean>;
/**
 * Check if the CLI was installed via npm globally
 * Handles multiple node versions (nvm scenarios)
 */
export declare function isCliInstalledViaNpm(): Promise<boolean>;
/**
 * Atomic migration: CLI from npm to bun installation
 * Installs bun version first, only removes npm if successful
 */
export declare function migrateCliToBun(targetVersion: string): Promise<void>;
//# sourceMappingURL=cli-bun-migration.d.ts.map