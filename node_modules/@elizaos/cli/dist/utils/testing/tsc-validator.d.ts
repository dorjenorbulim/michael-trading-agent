export interface TypeCheckResult {
    success: boolean;
    errors: string[];
    warnings: string[];
}
export declare function runTypeCheck(projectPath: string, strict?: boolean): Promise<TypeCheckResult>;
//# sourceMappingURL=tsc-validator.d.ts.map