import { EnvironmentProvider, ExecutionResult } from './providers';
import { Scenario } from './schema';
import { AgentServer } from '@elizaos/server';
import { UUID, IAgentRuntime } from '@elizaos/core';
export declare class LocalEnvironmentProvider implements EnvironmentProvider {
    private tempDir;
    private server;
    private agentId;
    private runtime;
    private serverPort;
    private trajectoryReconstructor;
    private conversationManager;
    constructor(server?: AgentServer, agentId?: UUID, _runtime?: IAgentRuntime, serverPort?: number);
    setup(scenario: Scenario): Promise<void>;
    private captureFileSystem;
    run(scenario: Scenario): Promise<ExecutionResult[]>;
    teardown(): Promise<void>;
}
//# sourceMappingURL=LocalEnvironmentProvider.d.ts.map