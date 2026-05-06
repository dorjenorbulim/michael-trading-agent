import { type DirectoryInfo } from '@/src/utils/directory-detection';
/**
 * Determines the project type using comprehensive directory detection
 */
export declare function getProjectType(testPath?: string): DirectoryInfo;
/**
 * Process filter name to remove extensions consistently
 *
 * Note: Test filtering works in two ways:
 * 1. Matching test suite names (the string in describe() blocks)
 * 2. Matching file names (without extension)
 *
 * For best results, use the specific test suite name you want to run.
 * The filter preserves case sensitivity to match bun's test filtering behavior.
 */
export declare function processFilterName(name?: string): string | undefined;
/**
 * Install plugin dependencies for testing
 */
export declare function installPluginDependencies(projectInfo: DirectoryInfo): Promise<void>;
//# sourceMappingURL=project-utils.d.ts.map