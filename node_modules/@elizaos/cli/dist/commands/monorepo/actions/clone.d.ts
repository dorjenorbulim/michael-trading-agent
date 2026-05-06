import { CloneInfo } from '../types';
/**
 * Clones a GitHub repository at a specified branch into a target directory.
 *
 * @param repo - The GitHub repository in "owner/repo" shorthand or full URL.
 * @param branch - The branch to clone from the repository.
 * @param destination - The directory where the repository will be cloned.
 *
 * @throws {Error} If the specified branch does not exist in the repository.
 * @throws {Error} If cloning fails for any other reason.
 */
export declare function cloneRepository(repo: string, branch: string, destination: string): Promise<void>;
/**
 * Prepares the destination directory for cloning
 *
 * Creates the directory if it doesn't exist, or validates that it's empty if it does exist.
 */
export declare function prepareDestination(dir: string): string;
/**
 * Main monorepo cloning action
 *
 * Handles the complete cloning process including directory preparation and error handling.
 */
export declare function cloneMonorepo(cloneInfo: CloneInfo): Promise<void>;
//# sourceMappingURL=clone.d.ts.map