/**
 * Utility helpers for resolving standard Eliza directories.
 *
 * All CLI-generated data should live under the hidden `.eliza` folder
 * that sits in the project root (i.e. <project>/.eliza/…).  By
 * centralising the path logic here we avoid the hard-coded scattered
 * variants that previously lived throughout the codebase.
 */
export declare function getElizaBaseDir(cwd?: string): string;
export declare function getElizaDbDir(cwd?: string): string;
export declare function getElizaDataDir(cwd?: string): string;
export declare function getElizaUploadsDir(cwd?: string): string;
export declare function getElizaGeneratedDir(cwd?: string): string;
export declare function getElizaCharactersDir(cwd?: string): string;
//# sourceMappingURL=eliza-paths.d.ts.map