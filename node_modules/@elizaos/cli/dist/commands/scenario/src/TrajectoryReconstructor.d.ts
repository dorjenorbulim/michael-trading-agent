/**
 * Non-Invasive Trajectory Reconstruction (Ticket #5785)
 *
 * This service reconstructs agent trajectory from existing database logs
 * and memories WITHOUT modifying the core runtime.
 */
import { IAgentRuntime, UUID } from '@elizaos/core';
/**
 * Agent trajectory step (matching GitHub ticket #5785 specification)
 */
export interface TrajectoryStep {
    /** Step type: 'thought', 'action', or 'observation' */
    type: 'thought' | 'action' | 'observation';
    /** ISO timestamp string */
    timestamp: string;
    /** Step content based on type */
    content: string | {
        name: string;
        parameters: Record<string, unknown>;
    } | Record<string, unknown>;
}
export interface ReconstructedTrajectory {
    steps: TrajectoryStep[];
    runId?: UUID;
    startTime: number;
    endTime: number;
    totalSteps: number;
}
export declare class TrajectoryReconstructor {
    private runtime;
    constructor(runtime: IAgentRuntime);
    /**
     * Reconstruct trajectory from memories (using same approach as TrajectoryContainsActionEvaluator)
     */
    reconstructTrajectory(roomId: UUID, timeWindowMs?: number): Promise<ReconstructedTrajectory>;
    /**
     * Get latest trajectory for a room (convenience method) with retry logic
     */
    getLatestTrajectory(roomId: UUID): Promise<TrajectoryStep[]>;
}
//# sourceMappingURL=TrajectoryReconstructor.d.ts.map