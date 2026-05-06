import { IAgentRuntime } from '@elizaos/core';
import { Scenario } from './schema';
type MockDefinition = NonNullable<NonNullable<Scenario['setup']>['mocks']>[0];
interface MockExecutionHistory {
    service: string;
    method: string;
    args: unknown[];
    matchedMock: MockDefinition;
    timestamp: Date;
    executionTime: number;
}
export declare class MockEngine {
    private runtime;
    private originalGetService;
    private mockRegistry;
    private mockHistory;
    private logger;
    constructor(runtime: IAgentRuntime);
    applyMocks(mocks?: MockDefinition[]): void;
    revertMocks(): void;
    getMockRegistry(): Map<string, {
        method: string;
        response: any;
        service?: string | undefined;
        when?: {
            args?: any[] | undefined;
            input?: Record<string, any> | undefined;
            context?: Record<string, any> | undefined;
            matcher?: string | undefined;
            partialArgs?: any[] | undefined;
        } | undefined;
        responseFn?: string | undefined;
        error?: {
            code: string;
            message: string;
            status?: number | undefined;
        } | undefined;
        metadata?: {
            delay?: number | undefined;
            probability?: number | undefined;
        } | undefined;
    }[]>;
    /**
     * Find the best matching mock using enhanced matching strategies
     */
    private findBestMatchingMock;
    /**
     * Execute a mock with enhanced features
     */
    private executeMock;
    /**
     * Enhanced condition matching with multiple strategies
     */
    private matchesCondition;
    /**
     * Extract input parameters from method arguments
     */
    private extractInputFromArgs;
    /**
     * Build request context for matching
     */
    private buildRequestContext;
    /**
     * Sort mocks by specificity (more specific conditions first)
     */
    private sortMocksBySpecificity;
    private calculateSpecificity;
    /**
     * Match input parameters
     */
    private matchesInput;
    /**
     * Match context parameters
     */
    private matchesContext;
    /**
     * Match partial arguments
     */
    private matchesPartialArgs;
    /**
     * Record mock execution for history and debugging
     */
    private recordMockExecution;
    /**
     * Get mock execution history
     */
    getMockHistory(): MockExecutionHistory[];
    /**
     * Clear mock history
     */
    clearMockHistory(): void;
    /**
     * Get mock statistics
     */
    getMockStatistics(): {
        totalExecutions: number;
        averageExecutionTime: number;
    };
    /**
     * Parse response template with safe variable interpolation
     * SECURITY: Only allows predefined variables, no arbitrary code execution
     */
    private parseResponseTemplate;
    /**
     * Evaluate template for boolean conditions
     * SECURITY: Only allows safe comparison operations, no arbitrary code execution
     */
    private evaluateTemplate;
    /**
     * Perform safe string interpolation
     * SECURITY: Only allows access to whitelisted variables
     */
    private interpolateTemplate;
    /**
     * Resolve template variables safely
     * SECURITY: Only allows access to predefined variable paths
     */
    private resolveTemplateVariable;
    /**
     * Perform safe comparison operations
     * SECURITY: Only allows whitelisted comparison operators
     */
    private performSafeComparison;
}
export {};
//# sourceMappingURL=MockEngine.d.ts.map