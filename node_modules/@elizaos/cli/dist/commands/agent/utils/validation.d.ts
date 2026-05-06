import type { OptionValues } from 'commander';
import { z } from 'zod';
import type { AgentBasic } from '../../shared';
export declare const AgentBasicSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    status: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export declare const AgentsListResponseSchema: z.ZodObject<{
    agents: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        status: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>;
}, z.core.$strip>;
/**
 * Asynchronously fetches a list of basic agent information from the server.
 */
export declare function getAgents(opts: OptionValues): Promise<AgentBasic[]>;
/**
 * Resolves the ID of an agent based on the provided name, ID, or index.
 */
export declare function resolveAgentId(idOrNameOrIndex: string, opts: OptionValues): Promise<string>;
//# sourceMappingURL=validation.d.ts.map