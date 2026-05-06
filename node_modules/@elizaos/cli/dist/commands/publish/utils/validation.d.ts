import { PackageJson } from '../types';
/**
 * Validate plugin requirements
 */
export declare function validatePluginRequirements(cwd: string, packageJson: PackageJson): Promise<void>;
/**
 * Check if user is a maintainer for the package
 */
export declare function isMaintainer(packageJson: PackageJson, username: string): boolean;
/**
 * Display appropriate registry publication messaging based on options and user status
 */
export declare function displayRegistryPublicationMessage(opts: {
    skipRegistry?: boolean;
    npm?: boolean;
}, userIsMaintainer: boolean, registryPrUrl?: string): void;
//# sourceMappingURL=validation.d.ts.map