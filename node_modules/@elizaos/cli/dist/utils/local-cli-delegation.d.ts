/**
 * Attempts to delegate to local CLI if available and not already running from it
 * This function should be called at the very beginning of the main CLI entry point
 *
 * @returns Promise<boolean> - true if delegated to local CLI, false if continuing with current CLI
 */
export declare function tryDelegateToLocalCli(): Promise<boolean>;
/**
 * Checks if a local CLI installation is available
 * @returns true if local CLI exists, false otherwise
 */
export declare function hasLocalCli(): boolean;
/**
 * Gets information about the current CLI execution context
 * @returns object with CLI execution context information
 */
export declare function getCliContext(): {
    isLocal: boolean;
    hasLocal: boolean;
    localPath: string | null;
    currentPath: string;
};
//# sourceMappingURL=local-cli-delegation.d.ts.map