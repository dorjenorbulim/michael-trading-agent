/**
 * Docker Build Utilities
 * Handles Docker image building and pushing to ECR
 */
export interface DockerBuildOptions {
    projectPath: string;
    dockerfile?: string;
    imageTag: string;
    buildArgs?: Record<string, string>;
    target?: string;
    platform?: string;
}
export interface DockerBuildResult {
    success: boolean;
    imageTag: string;
    imageId?: string;
    size?: number;
    checksum?: string;
    error?: string;
}
export interface DockerPushOptions {
    imageTag: string;
    ecrRegistryUrl: string;
    ecrAuthToken: string;
    ecrImageUri?: string;
}
export interface DockerPushResult {
    success: boolean;
    imageDigest?: string;
    repositoryUri?: string;
    error?: string;
}
/**
 * Check if Docker is installed and running
 */
export declare function checkDockerAvailable(): Promise<boolean>;
/**
 * Ensure Dockerfile exists, create from template if needed
 */
export declare function ensureDockerfile(projectPath: string): Promise<string>;
/**
 * Build Docker image
 */
export declare function buildDockerImage(options: DockerBuildOptions): Promise<DockerBuildResult>;
/**
 * Push Docker image to ECR
 */
export declare function pushDockerImage(options: DockerPushOptions): Promise<DockerPushResult>;
/**
 * Build and push Docker image in one operation
 */
export declare function buildAndPushImage(buildOptions: DockerBuildOptions, pushOptions: DockerPushOptions): Promise<{
    buildResult: DockerBuildResult;
    pushResult?: DockerPushResult;
}>;
/**
 * Clean up local Docker images
 */
export declare function cleanupLocalImages(imageTags: string[]): Promise<void>;
//# sourceMappingURL=docker-build.d.ts.map