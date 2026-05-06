/**
 * Deploy Command Types
 * Types for deploying ElizaOS projects to AWS ECS
 */
export interface DeployOptions {
    name?: string;
    projectName?: string;
    port?: number;
    desiredCount?: number;
    cpu?: number;
    memory?: number;
    apiKey?: string;
    apiUrl?: string;
    env?: string[];
    skipBuild?: boolean;
    imageUri?: string;
    platform?: string;
}
export interface DeploymentResult {
    success: boolean;
    containerId?: string;
    serviceArn?: string;
    taskDefinitionArn?: string;
    url?: string;
    error?: string;
}
export interface ContainerConfig {
    name: string;
    project_name: string;
    description?: string;
    port: number;
    desired_count: number;
    cpu: number;
    memory: number;
    environment_vars?: Record<string, string>;
    health_check_path: string;
    ecr_image_uri: string;
    ecr_repository_uri?: string;
    image_tag?: string;
    architecture?: 'arm64' | 'x86_64';
}
/**
 * Base API response structure
 */
export interface CloudApiResponseBase {
    success: boolean;
    error?: string;
    message?: string;
}
/**
 * API response for successful operations with data
 */
export interface CloudApiSuccessResponse<T> extends CloudApiResponseBase {
    success: true;
    data: T;
    error?: never;
}
/**
 * API response for failed operations
 */
export interface CloudApiErrorResponse extends CloudApiResponseBase {
    success: false;
    data?: never;
    error: string;
    details?: Record<string, unknown>;
}
/**
 * API response with credit information
 */
export interface CloudApiResponseWithCredits<T> extends CloudApiSuccessResponse<T> {
    creditsDeducted: number;
    creditsRemaining: number;
}
/**
 * API response for quota checks
 */
export interface CloudApiQuotaResponse extends CloudApiSuccessResponse<QuotaInfo> {
    data: QuotaInfo;
}
/**
 * Generic API response type (union of success and error)
 */
export type CloudApiResponse<T = Record<string, string | number | boolean | null> | string | number | boolean | null> = CloudApiSuccessResponse<T> | CloudApiErrorResponse | CloudApiResponseWithCredits<T>;
/**
 * Quota information for container deployments
 */
export interface QuotaInfo {
    quota: {
        max: number;
        current: number;
        remaining: number;
    };
    credits: {
        balance: number;
    };
    billing?: {
        model: 'daily';
        dailyCostPerContainer: number;
        monthlyEquivalent: number;
        currentDailyBurn: number;
        runningContainers: number;
        daysOfRunway: number | null;
        warningThreshold: number;
        shutdownWarningHours: number;
    };
    pricing: {
        totalForNewContainer: number;
        imageUpload?: number;
        containerDeployment?: number;
        perDay?: number;
        perMonth?: number;
    };
}
/**
 * Container data from API
 */
export interface ContainerData {
    id: string;
    name: string;
    project_name: string;
    status: string;
    ecs_service_arn?: string;
    ecs_task_definition_arn?: string;
    load_balancer_url?: string;
    deployment_url?: string;
    error_message?: string;
    created_at?: string;
    updated_at?: string;
    port?: number;
    desired_count?: number;
    cpu?: number;
    memory?: number;
    environment_vars?: Record<string, string>;
    health_check_path?: string;
    is_update?: string;
    cloudformation_stack_name?: string;
}
/**
 * Image build and push request
 */
export interface ImageBuildRequest {
    projectId: string;
    version: string;
    metadata?: Record<string, string>;
}
/**
 * Image build and push response from Cloud API
 * Returns ECR repository and authentication information
 */
export interface ImageBuildResponse {
    ecrRepositoryUri: string;
    ecrImageUri: string;
    ecrImageTag: string;
    authToken: string;
    authTokenExpiresAt: string;
    registryEndpoint: string;
}
/**
 * Docker build context
 */
export interface DockerBuildContext {
    projectPath: string;
    dockerfile?: string;
    buildArgs?: Record<string, string>;
    target?: string;
}
//# sourceMappingURL=types.d.ts.map