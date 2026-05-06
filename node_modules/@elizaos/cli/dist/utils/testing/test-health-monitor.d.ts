export interface TestResult {
    name: string;
    duration: number;
    status: 'passed' | 'failed' | 'skipped';
    error?: string;
}
export interface TestRun {
    date: Date;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    tests: TestResult[];
}
export interface TestHealth {
    lastRun: Date;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    flakyTests: string[];
    averageRuntime: number;
    slowestTests: Array<{
        name: string;
        duration: number;
    }>;
    testHistory: TestRun[];
}
export declare class TestHealthMonitor {
    private healthDataPath;
    private maxHistorySize;
    constructor(dataDir?: string);
    private ensureDataDir;
    recordTestRun(results: TestRun): void;
    private updateFlakyTests;
    getHealth(): TestHealth;
    private saveHealth;
    generateReport(): string;
    getTestTrends(): {
        successRateHistory: number[];
        durationHistory: number[];
        dates: Date[];
    };
}
//# sourceMappingURL=test-health-monitor.d.ts.map