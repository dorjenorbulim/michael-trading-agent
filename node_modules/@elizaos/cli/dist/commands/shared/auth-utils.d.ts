import type { OptionValues } from 'commander';
import type { ApiClientConfig } from '@elizaos/api-client';
/**
 * Get authentication headers for API requests
 * @param opts - Command options that may contain auth information
 * @returns Headers object with authentication if token is available
 */
export declare function getAuthHeaders(opts: OptionValues): Record<string, string>;
/**
 * Create ApiClientConfig from CLI options
 * @param opts - Command options that may contain auth and connection information
 * @returns ApiClientConfig for use with @elizaos/api-client
 */
export declare function createApiClientConfig(opts: OptionValues): ApiClientConfig;
//# sourceMappingURL=auth-utils.d.ts.map