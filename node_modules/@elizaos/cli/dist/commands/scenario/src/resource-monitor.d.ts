/**
 * Resource Monitoring System for Matrix Testing
 *
 * This module monitors system resources (memory, disk, CPU) during matrix
 * execution to prevent resource exhaustion and provide intelligent recommendations
 * for parallel execution limits.
 *
 * Required by ticket #5782 - Acceptance Criterion 7.
 */
/**
 * Current system resource usage information.
 */
export interface SystemResources {
    /** Memory usage percentage (0-100) */
    memoryUsage: number;
    /** Total system memory in bytes */
    totalMemory: number;
    /** Free system memory in bytes */
    freeMemory: number;
    /** Disk usage percentage (0-100) */
    diskUsage: number;
    /** Total disk space in bytes */
    totalDisk: number;
    /** Free disk space in bytes */
    freeDisk: number;
    /** CPU usage percentage (0-100) */
    cpuUsage: number;
    /** Number of CPU cores */
    cpuCores: number;
    /** System load average */
    loadAverage: number[];
}
/**
 * Resource threshold configuration.
 */
export interface ResourceThresholds {
    /** Memory usage warning threshold (percentage) */
    memoryWarning: number;
    /** Memory usage critical threshold (percentage) */
    memoryCritical: number;
    /** Disk usage warning threshold (percentage) */
    diskWarning: number;
    /** Disk usage critical threshold (percentage) */
    diskCritical: number;
    /** CPU usage warning threshold (percentage) */
    cpuWarning: number;
    /** CPU usage critical threshold (percentage) */
    cpuCritical: number;
}
/**
 * Resource alert information.
 */
export interface ResourceAlert {
    /** Type of alert */
    type: 'warning' | 'critical';
    /** Resource that triggered the alert */
    resource: 'memory' | 'disk' | 'cpu';
    /** Current usage percentage */
    currentUsage: number;
    /** Threshold that was exceeded */
    threshold: number;
    /** Alert message */
    message: string;
    /** When the alert was triggered */
    timestamp: Date;
    /** Recommendation for action */
    recommendation?: string;
}
/**
 * Historical resource usage data point.
 */
export interface ResourceDataPoint {
    /** When this data point was recorded */
    timestamp: Date;
    /** Memory usage at this time */
    memoryUsage: number;
    /** Disk usage at this time */
    diskUsage: number;
    /** CPU usage at this time */
    cpuUsage: number;
}
/**
 * Resource usage statistics.
 */
export interface ResourceStatistics {
    memory: {
        current: number;
        average: number;
        min: number;
        max: number;
    };
    disk: {
        current: number;
        average: number;
        min: number;
        max: number;
    };
    cpu: {
        current: number;
        average: number;
        min: number;
        max: number;
    };
}
/**
 * Configuration for the resource monitor.
 */
export interface ResourceMonitorConfig {
    /** Resource thresholds */
    thresholds: ResourceThresholds;
    /** Callback for resource alerts */
    onAlert?: (alert: ResourceAlert) => void;
    /** Callback for resource updates */
    onUpdate?: (resources: SystemResources) => void;
    /** Callback for performance recommendations */
    onRecommendation?: (recommendation: string) => void;
    /** How often to check resources in milliseconds */
    checkInterval?: number;
    /** Maximum number of historical data points to keep */
    maxHistorySize?: number;
}
/**
 * Disk usage information.
 */
export interface DiskUsage {
    /** Total disk space in bytes */
    total: number;
    /** Used disk space in bytes */
    used: number;
    /** Free disk space in bytes */
    free: number;
    /** Usage percentage (0-100) */
    usage: number;
}
/**
 * Main resource monitoring class.
 */
export declare class ResourceMonitor {
    private config;
    private intervalId;
    private history;
    private lastAlerts;
    constructor(config: ResourceMonitorConfig);
    /**
     * Starts monitoring system resources.
     */
    start(): void;
    /**
     * Stops monitoring system resources.
     */
    stop(): void;
    /**
     * Updates the resource thresholds.
     */
    updateThresholds(thresholds: ResourceThresholds): void;
    /**
     * Gets the current resource thresholds.
     */
    getThresholds(): ResourceThresholds;
    /**
     * Gets the resource usage history.
     */
    getResourceHistory(): ResourceDataPoint[];
    /**
     * Gets resource usage statistics.
     */
    getStatistics(): ResourceStatistics;
    /**
     * Checks if there's sufficient disk space for a given requirement.
     */
    checkDiskSpace(requiredBytes: number): boolean;
    /**
     * Parses a human-readable byte string to bytes.
     */
    parseBytes(bytesStr: string): number;
    /**
     * Checks system resources and triggers alerts if needed.
     */
    private checkResources;
    /**
     * Checks resource thresholds and emits alerts.
     */
    private checkThresholds;
    /**
     * Emits an alert, but throttles repeated alerts.
     */
    private emitThrottledAlert;
    /**
     * Emits a resource alert.
     */
    private emitAlert;
    /**
     * Generates performance recommendations based on resource trends.
     */
    private generateRecommendations;
    /**
     * Gets current resources synchronously (simplified version).
     */
    private getCurrentResourcesSync;
}
/**
 * Gets current system resource usage.
 */
export declare function getSystemResources(): Promise<SystemResources>;
/**
 * Calculates disk usage for a specific directory.
 */
export declare function calculateDiskUsage(dirPath: string): Promise<DiskUsage>;
/**
 * Formats bytes into human-readable format.
 */
export declare function formatBytes(bytes: number): string;
/**
 * Creates a new resource monitor with the specified configuration.
 */
export declare function createResourceMonitor(config: ResourceMonitorConfig): ResourceMonitor;
//# sourceMappingURL=resource-monitor.d.ts.map