import { UUID } from '@elizaos/core';
import { BaseApiClient } from '../lib/base-client';
import { ListRunsParams, RunDetail, RunSummary } from '../types/runs';
export declare class RunsService extends BaseApiClient {
    listRuns(agentId: UUID, params?: ListRunsParams): Promise<{
        runs: RunSummary[];
        total: number;
        hasMore: boolean;
    }>;
    getRun(agentId: UUID, runId: UUID, roomId?: UUID): Promise<RunDetail>;
}
//# sourceMappingURL=runs.d.ts.map