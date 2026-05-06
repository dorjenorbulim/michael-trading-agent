import { z } from 'zod';
/**
 * Zod schema for create command options validation
 */
export declare const initOptionsSchema: z.ZodObject<{
    yes: z.ZodDefault<z.ZodBoolean>;
    type: z.ZodDefault<z.ZodEnum<{
        plugin: "plugin";
        project: "project";
        agent: "agent";
        tee: "tee";
    }>>;
}, z.core.$strip>;
export type CreateOptions = z.infer<typeof initOptionsSchema>;
/**
 * Available AI model configuration
 */
export interface AIModelOption {
    title: string;
    value: string;
    description: string;
}
/**
 * Available database configuration
 */
export interface DatabaseOption {
    title: string;
    value: string;
    description: string;
}
//# sourceMappingURL=types.d.ts.map