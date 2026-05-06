import { type IAgentRuntime, type ProjectAgent } from '@elizaos/core';
interface TestStats {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    hasTests: boolean;
}
interface TestOptions {
    filter?: string;
    skipPlugins?: boolean;
    skipProjectTests?: boolean;
    skipE2eTests?: boolean;
}
export declare class TestRunner {
    private runtime;
    private projectAgent?;
    private stats;
    private isDirectPluginTest;
    private pluginUnderTest?;
    constructor(runtime: IAgentRuntime, projectAgent?: ProjectAgent);
    /**
     * Helper method to check if a test suite name matches the filter
     * @param name The name of the test suite
     * @param filter Optional filter string
     * @returns True if the name matches the filter or if no filter is specified
     */
    private matchesFilter;
    /**
     * Runs a test suite
     * @param suite The test suite to run
     */
    private runTestSuite;
    /**
     * Runs project agent tests
     */
    private runProjectTests;
    /**
     * Runs plugin tests (only when in a plugin directory)
     */
    private runPluginTests;
    /**
     * Runs tests from the e2e directory
     */
    private runE2eTests;
    /**
     * Runs all tests in the project
     * @param options Test options
     */
    runTests(options?: TestOptions): Promise<TestStats>;
}
export {};
//# sourceMappingURL=test-runner.d.ts.map