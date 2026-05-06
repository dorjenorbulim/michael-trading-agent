import { Credentials, PackageJson, PublishResult } from '../types';
/**
 * Publish package to GitHub and optionally to registry
 */
export declare function publishToGitHubAction(cwd: string, packageJson: PackageJson, credentials: Credentials, skipRegistry?: boolean, dryRun?: boolean): Promise<PublishResult>;
//# sourceMappingURL=github-publish.d.ts.map