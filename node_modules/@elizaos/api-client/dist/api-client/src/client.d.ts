import { ApiClientConfig } from './types/base';
import { AgentsService } from './services/agents';
import { MessagingService } from './services/messaging';
import { MemoryService } from './services/memory';
import { AudioService } from './services/audio';
import { MediaService } from './services/media';
import { ServerService } from './services/server';
import { SystemService } from './services/system';
import { SessionsService } from './services/sessions';
import { RunsService } from './services/runs';
import { JobsService } from './services/jobs';
export declare class ElizaClient {
    readonly agents: AgentsService;
    readonly messaging: MessagingService;
    readonly memory: MemoryService;
    readonly audio: AudioService;
    readonly media: MediaService;
    readonly server: ServerService;
    readonly system: SystemService;
    readonly sessions: SessionsService;
    readonly runs: RunsService;
    readonly jobs: JobsService;
    constructor(config: ApiClientConfig);
    /**
     * Create a new ElizaClient instance
     */
    static create(config: ApiClientConfig): ElizaClient;
}
//# sourceMappingURL=client.d.ts.map