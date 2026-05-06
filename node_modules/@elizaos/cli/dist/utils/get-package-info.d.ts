import type { PackageJson } from 'type-fest';
/**
 * Get the current version of a package from the monorepo
 */
/**
 * Retrieves the version of a specified package.
 *
 * @param {string} packageName - The name of the package to retrieve the version for.
 * @returns {Promise<string>} A promise that resolves with the version of the package.
 */
export declare function getPackageVersion(packageName: string): Promise<string>;
/**
 * Get local packages available in the monorepo
 */
export declare function getLocalPackages(): Promise<string[]>;
export declare function getPackageInfo(): Promise<PackageJson>;
//# sourceMappingURL=get-package-info.d.ts.map