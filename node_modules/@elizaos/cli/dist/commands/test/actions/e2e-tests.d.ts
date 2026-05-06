import { type DirectoryInfo } from '@/src/utils/directory-detection';
import { E2ETestOptions, TestResult } from '../types';
/**
 * Function that runs the end-to-end tests.
 *
 * Sets up a complete test environment with database, server, and agents, then executes e2e tests using the TestRunner framework.
 */
export declare function runE2eTests(testPath: string | undefined, options: E2ETestOptions, projectInfo: DirectoryInfo): Promise<TestResult>;
//# sourceMappingURL=e2e-tests.d.ts.map