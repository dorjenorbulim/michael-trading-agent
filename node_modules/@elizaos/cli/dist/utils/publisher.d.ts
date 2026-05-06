interface PackageJson {
    name: string;
    version: string;
    description?: string;
    author?: string;
    repository?: {
        url?: string;
    };
    keywords?: string[];
    categories?: string[];
    platform?: 'node' | 'browser' | 'universal';
    packageType?: 'plugin' | 'project';
    type?: string;
    npmPackage?: string;
}
/**
 * Tests whether the current environment is ready to publish an npm package from the specified directory.
 *
 * Performs checks for npm login status, build success, and publish permissions in the given directory.
 *
 * @param cwd - The directory containing the npm package to test.
 * @returns `true` if all checks pass; otherwise, `false`.
 */
export declare function testPublishToNpm(cwd: string): Promise<boolean>;
/**
 * Tests whether the current user has the necessary GitHub credentials and permissions to publish a package and update the registry.
 *
 * For projects, verifies that a valid GitHub token is available. For plugins, additionally checks the ability to fork the registry repository, create a branch, and update files within that branch.
 *
 * @param cwd - The working directory of the package.
 * @param packageJson - The parsed package.json metadata for the package.
 * @param username - The GitHub username to use for repository operations.
 * @returns `true` if all required GitHub permissions and operations succeed; otherwise, `false`.
 */
export declare function testPublishToGitHub(packageJson: PackageJson, username: string): Promise<boolean>;
export declare function publishToNpm(cwd: string): Promise<boolean>;
/**
 * Publishes a package to GitHub and optionally updates the ElizaOS registry for plugins.
 *
 * For both plugins and projects, this function creates or verifies a GitHub repository, pushes the local code, and returns success. For plugins (unless {@link skipRegistry} is true), it also updates the ElizaOS registry by forking the registry repository, creating a branch, updating or creating the package metadata, updating the registry index, and opening a pull request.
 *
 * @param cwd - The working directory containing the package to publish.
 * @param packageJson - The parsed package.json object for the package.
 * @param username - The GitHub username of the publisher.
 * @param skipRegistry - If true, skips registry updates and only publishes to GitHub.
 * @param isTest - If true, runs in test mode without making actual changes.
 * @returns True on success, or an object with success status and pull request URL if a registry PR is created; false on failure.
 *
 * @throws {Error} If required fields are missing or if publishing steps fail.
 *
 * @remark
 * - For projects or when {@link skipRegistry} is true, registry updates are skipped and only the GitHub repository is updated.
 * - For plugins, registry updates include metadata and index updates, and a pull request to the registry repository.
 */
export declare function publishToGitHub(cwd: string, packageJson: PackageJson, username: string, skipRegistry?: boolean, isTest?: boolean): Promise<boolean | {
    success: boolean;
    prUrl?: string;
}>;
export {};
//# sourceMappingURL=publisher.d.ts.map