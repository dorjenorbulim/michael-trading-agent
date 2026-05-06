export declare class TestTimeoutManager {
    private static instance;
    private timeouts;
    private testStartTimes;
    static getInstance(): TestTimeoutManager;
    startTimeout(testName: string, duration?: number): void;
    clearTimeout(testName: string): void;
    clearAll(): void;
}
export declare const testTimeout: TestTimeoutManager;
//# sourceMappingURL=timeout-manager.d.ts.map