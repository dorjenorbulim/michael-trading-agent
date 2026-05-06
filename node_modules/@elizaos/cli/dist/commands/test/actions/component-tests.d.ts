import { type DirectoryInfo } from '@/src/utils/directory-detection';
import { ComponentTestOptions, TestResult } from '../types';
/**
 * Run component tests using bun test
 *
 * Executes component tests for the project using bun test as the test runner. Supports filtering by test name and can optionally skip the build step for faster iteration.
 */
export declare function runComponentTests(testPath: string | undefined, options: ComponentTestOptions, projectInfo: DirectoryInfo): Promise<TestResult>;
//# sourceMappingURL=component-tests.d.ts.map