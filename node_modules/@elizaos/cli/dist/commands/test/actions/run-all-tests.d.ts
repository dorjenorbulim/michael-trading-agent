import { TestCommandOptions } from '../types';
/**
 * Run both component and E2E tests
 *
 * Executes a comprehensive test suite including both component tests (via bun test) and end-to-end tests (via TestRunner). Component tests run first, followed by e2e tests.
 */
export declare function runAllTests(testPath: string | undefined, options: TestCommandOptions): Promise<void>;
//# sourceMappingURL=run-all-tests.d.ts.map