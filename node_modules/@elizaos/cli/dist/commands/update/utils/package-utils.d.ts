import { UpdateCheckResult, PackageUpdate } from '../types';
/**
 * Check for available updates
 */
export declare function checkForUpdates(dependencies: Record<string, string>): Promise<UpdateCheckResult>;
/**
 * Display update summary
 */
export declare function displayUpdateSummary(updates: Record<string, PackageUpdate>): void;
/**
 * Update package.json with new versions
 */
export declare function updatePackageJson(packageJsonPath: string, updates: Record<string, PackageUpdate>): Promise<void>;
/**
 * Install dependencies using the detected package manager
 */
export declare function installDependencies(cwd: string): Promise<void>;
//# sourceMappingURL=package-utils.d.ts.map