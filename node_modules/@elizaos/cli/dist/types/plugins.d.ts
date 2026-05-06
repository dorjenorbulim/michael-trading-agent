export type RawRegistry = Record<string, string>;
export interface VersionInfo {
    git?: {
        repo: string;
        v0?: {
            version: string | null;
            branch: string | null;
        };
        v1?: {
            version: string | null;
            branch: string | null;
        };
    };
    npm?: {
        repo: string;
        v0?: string | null;
        v1?: string | null;
    };
    supports: {
        v0: boolean;
        v1: boolean;
    };
}
export interface CachedRegistry {
    lastUpdatedAt: string;
    registry: Record<string, VersionInfo>;
}
//# sourceMappingURL=plugins.d.ts.map