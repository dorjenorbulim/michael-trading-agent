import { PackageMetadata } from '../types';
/**
 * Update the registry index with the package information
 */
export declare function updateRegistryIndex(packageMetadata: PackageMetadata, dryRun?: boolean): Promise<boolean>;
/**
 * Save package metadata to registry
 */
export declare function savePackageToRegistry(packageMetadata: PackageMetadata, dryRun?: boolean): Promise<boolean>;
//# sourceMappingURL=registry-publish.d.ts.map