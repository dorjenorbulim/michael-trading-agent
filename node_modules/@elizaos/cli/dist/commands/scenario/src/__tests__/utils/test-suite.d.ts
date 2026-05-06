import { type IAgentRuntime } from '@elizaos/core';
/**
 * Base class for E2E test suites that work with the ElizaOS test runner.
 *
 * This follows the ElizaOS testing pattern where test classes are instantiated
 * by the TestRunner and provided with a live IAgentRuntime instance.
 */
export declare abstract class TestSuite {
    /** Human-readable name for this test suite */
    abstract name: string;
    /** Map of test names to test functions */
    abstract tests: Record<string, (runtime: IAgentRuntime) => Promise<void>>;
    /**
     * Simple assertion helper for test validation.
     * Throws an error if the condition is false.
     */
    protected expect(actual: any): {
        toBe: (expected: any) => void;
        toEqual: (expected: any) => void;
        toBeDefined: () => void;
        toBeUndefined: () => void;
        toBeNull: () => void;
        toBeGreaterThan: (expected: number) => void;
        toBeLessThan: (expected: number) => void;
        toContain: (expected: any) => void;
        toThrow: () => void;
    };
}
//# sourceMappingURL=test-suite.d.ts.map