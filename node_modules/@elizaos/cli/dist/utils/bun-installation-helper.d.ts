export interface BunInstallationResult {
    installed: boolean;
    message: string;
    error?: string;
}
export declare function checkBunInstallation(): Promise<BunInstallationResult>;
export declare function displayBunInstallInstructions(): void;
/**
 * Returns a compact installation tip for bun
 */
export declare function displayBunInstallationTipCompact(): string;
//# sourceMappingURL=bun-installation-helper.d.ts.map