/**
 * ElizaOS Cloud API Client
 * Handles communication with the ElizaOS Cloud backend for deployments
 */
import type { ContainerConfig, CloudApiResponse, QuotaInfo, ContainerData } from '../types';
export interface ApiClientOptions {
    apiKey: string;
    apiUrl: string;
}
export declare class CloudApiClient {
    private apiKey;
    private apiUrl;
    private readonly DEFAULT_TIMEOUT_MS;
    constructor(options: ApiClientOptions);
    /**
     * Fetch with timeout helper
     */
    private fetchWithTimeout;
    /**
     * Parse API error response with support for multiple formats
     */
    private parseErrorResponse;
    /**
     * Handle API errors consistently
     */
    private handleApiError;
    /**
     * Get container quota and pricing information
     */
    getQuota(): Promise<CloudApiResponse<QuotaInfo>>;
    /**
     * Create a new container deployment
     */
    createContainer(config: ContainerConfig): Promise<CloudApiResponse<ContainerData>>;
    /**
     * List all containers for the authenticated user
     */
    listContainers(): Promise<CloudApiResponse<ContainerData[]>>;
    /**
     * Get container status
     */
    getContainer(containerId: string): Promise<CloudApiResponse<ContainerData>>;
    /**
     * Delete a container
     */
    deleteContainer(containerId: string): Promise<CloudApiResponse>;
    /**
     * Poll container status until it reaches a terminal state
     * Matches Cloud API deployment timeout of 10 minutes
     */
    waitForDeployment(containerId: string, options?: {
        maxAttempts?: number;
        intervalMs?: number;
        onProgress?: (status: string, attempt: number, maxAttempts: number) => void;
    }): Promise<CloudApiResponse<ContainerData>>;
    /**
     * Request ECR credentials and repository for image build
     */
    requestImageBuild(request: {
        projectId: string;
        version: string;
        metadata?: Record<string, string>;
    }): Promise<CloudApiResponse<any>>;
}
/**
 * Get API credentials from environment or config
 */
export declare function getApiCredentials(): {
    apiKey: string;
    apiUrl: string;
} | null;
//# sourceMappingURL=api-client.d.ts.map