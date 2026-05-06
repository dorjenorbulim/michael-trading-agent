export interface DirectoryInfo {
    type: 'elizaos-project' | 'elizaos-plugin' | 'elizaos-monorepo' | 'elizaos-subdir' | 'non-elizaos-dir';
    hasPackageJson: boolean;
    hasElizaOSDependencies: boolean;
    packageName?: string;
    elizaPackageCount: number;
    monorepoRoot?: string;
}
/**
 * Detects the type of directory and provides comprehensive information about it
 * @param dir The directory path to analyze
 * @returns DirectoryInfo object with detection results
 */
export declare function detectDirectoryType(dir: string): DirectoryInfo;
/**
 * Checks if the directory is suitable for ElizaOS package updates
 */
export declare function isValidForUpdates(info: DirectoryInfo): boolean;
//# sourceMappingURL=directory-detection.d.ts.map