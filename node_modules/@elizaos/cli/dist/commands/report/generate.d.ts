/**
 * Report Generate Command Implementation
 *
 * This module implements the 'elizaos report generate' subcommand that processes
 * raw JSON outputs from Scenario Matrix runs and generates comprehensive reports.
 *
 * Required by ticket #5787 - CLI Command Registration and Implementation.
 */
import { Command } from 'commander';
import { ScenarioRunResult } from '../scenario/src/schema';
import { MatrixConfig } from '../scenario/src/matrix-schema';
export interface GenerateCommandOptions {
    outputPath?: string;
    format?: string;
}
export interface DataIngestionResult {
    validRuns: ScenarioRunResult[];
    matrixConfig: MatrixConfig;
    fileStats: {
        processed: number;
        skipped: number;
        errors: string[];
    };
}
/**
 * Create and configure the 'generate' subcommand
 */
export declare function createGenerateCommand(): Command;
/**
 * Main execution logic for the generate command
 */
export declare function executeGenerateCommand(inputDir: string, options: GenerateCommandOptions): Promise<void>;
//# sourceMappingURL=generate.d.ts.map