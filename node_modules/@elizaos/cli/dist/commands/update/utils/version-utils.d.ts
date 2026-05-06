import { VersionCheckResult } from '../types';
export declare const SPECIAL_VERSION_TAGS: string[];
export declare const ELIZAOS_ORG = "@elizaos";
export declare const FALLBACK_VERSION = "0.0.0";
/**
 * Get current CLI version using UserEnvironment
 */
export declare function getVersion(): Promise<string>;
/**
 * Check if version string is a workspace reference
 */
export declare const isWorkspaceVersion: (version: string) => boolean;
/**
 * Check if version is a special tag
 */
export declare const isSpecialVersionTag: (version: string) => boolean;
/**
 * Version comparison helper
 */
export declare function checkVersionNeedsUpdate(currentVersion: string, targetVersion: string): VersionCheckResult;
/**
 * Check for major version update
 */
export declare function isMajorUpdate(currentVersion: string, targetVersion: string): boolean;
/**
 * Fetch latest package version from npm registry
 */
export declare function fetchLatestVersion(packageName: string): Promise<string | null>;
//# sourceMappingURL=version-utils.d.ts.map