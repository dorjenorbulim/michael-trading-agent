export declare function isRunningFromNodeModules(): boolean;
export declare function getVersion(): string;
export declare function getCliInstallTag(): string;
export declare function isUtf8Locale(): boolean;
export declare function getLatestCliVersion(currentVersion: string): Promise<string | null>;
export declare function showUpdateNotification(currentVersion: string, latestVersion: string): void;
export declare function checkAndShowUpdateNotification(currentVersion: string): Promise<boolean>;
export declare function displayBanner(skipUpdateCheck?: boolean): Promise<void>;
//# sourceMappingURL=display-banner.d.ts.map