/**
 * Utility to determine the distribution channel of a version
 */
/**
 * Determine the distribution channel of a version string
 * @param version - The version string to check
 * @returns The channel: 'latest' (stable), 'alpha', or 'beta'
 */
export declare function getVersionChannel(version: string): 'latest' | 'alpha' | 'beta';
/**
 * Get the latest CLI version for a specific distribution channel
 * @param currentVersion - The current version to determine the channel
 * @returns The latest version if newer than current, or null if already up-to-date
 */
export declare function getLatestCliVersionForChannel(currentVersion: string): Promise<string | null>;
/**
 * Detailed outcome for channel-aware version checks so callers can
 * distinguish between "no update available" and "error occurred".
 */
export type ChannelVersionCheckOutcome = {
    status: 'update_available';
    version: string;
} | {
    status: 'up_to_date';
} | {
    status: 'error';
    message?: string;
};
/**
 * Check the latest CLI version for the current channel with explicit outcome.
 * Never throws; returns a discriminated result instead.
 */
export declare function checkLatestCliVersionForChannel(currentVersion: string): Promise<ChannelVersionCheckOutcome>;
//# sourceMappingURL=version-channel.d.ts.map