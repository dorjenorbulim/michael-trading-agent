interface GitHubUserResponse {
    login: string;
    id?: number;
    avatar_url?: string;
    name?: string;
    email?: string;
    [key: string]: string | number | boolean | undefined;
}
/**
 * Validate a GitHub token with the API
 */
export declare function validateGitHubToken(token: string): Promise<boolean>;
/**
 * Check if a fork exists for a given repository
 */
export declare function forkExists(token: string, repo: string, username: string): Promise<boolean>;
/**
 * Fork a repository
 */
export declare function forkRepository(token: string, owner: string, repo: string): Promise<string | null>;
/**
 * Check if a branch exists in a repository
 */
export declare function branchExists(token: string, owner: string, repo: string, branch: string): Promise<boolean>;
/**
 * Create a new branch in a repository
 */
export declare function createBranch(token: string, owner: string, repo: string, branch: string, baseBranch?: string): Promise<boolean>;
/**
 * Get content of a file from a repository
 */
export declare function getFileContent(token: string, owner: string, repo: string, path: string, branch?: string): Promise<string | null>;
/**
 * Create or update a file in a repository
 */
export declare function updateFile(token: string, owner: string, repo: string, path: string, content: string, message: string, branch?: string): Promise<boolean>;
/**
 * Create a pull request
 */
export declare function createPullRequest(token: string, owner: string, repo: string, title: string, body: string, head: string, base?: string): Promise<string | null>;
/**
 * Get authenticated user information
 */
export declare function getAuthenticatedUser(token: string): Promise<GitHubUserResponse | null>;
/**
 * Retrieves GitHub credentials from the environment, registry, or user prompt.
 *
 * Attempts to obtain a valid GitHub username and personal access token by first checking environment variables, then a stored registry, and finally prompting the user if necessary. Validates the token before returning credentials.
 *
 * @returns An object containing the GitHub username and token if valid credentials are found or provided, otherwise `null`.
 */
export declare function getGitHubCredentials(): Promise<{
    username: string;
    token: string;
} | null>;
/**
 * Saves the provided GitHub username and token to the `.env` file in the user's `.eliza` directory.
 *
 * Updates or adds the `GITHUB_USERNAME` and `GITHUB_TOKEN` entries in the file and sets them in the current process environment.
 */
export declare function saveGitHubCredentials(username: string, token: string): Promise<void>;
/**
 * Ensure a directory exists in the repository
 */
export declare function ensureDirectory(token: string, repo: string, path: string, branch: string): Promise<boolean>;
/**
 * Create a new GitHub repository
 */
export declare function createGitHubRepository(token: string, repoName: string, description: string, isPrivate?: boolean, topics?: string[]): Promise<{
    success: boolean;
    repoUrl?: string;
    message?: string;
}>;
/**
 * Push local code to GitHub repository
 */
export declare function pushToGitHub(cwd: string, repoUrl: string, branch?: string): Promise<boolean>;
export {};
//# sourceMappingURL=github.d.ts.map