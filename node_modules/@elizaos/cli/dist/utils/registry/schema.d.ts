import { z } from 'zod';
export declare const registrySchema: z.ZodRecord<z.ZodString, z.ZodString>;
/**
 * Defines the possible types of plugins:
 * - "adapter"
 * - "client"
 * - "plugin"
 */
export type PluginType = 'adapter' | 'client' | 'plugin';
/**
 * Function that determines the type of plugin based on the name provided.
 * @param {string} name - The name of the plugin.
 * @returns {PluginType} The type of plugin ('adapter', 'client', or 'plugin').
 */
export declare function getPluginType(name: string): PluginType;
/**
 * Type definition for the Registry type which is inferred from the registrySchema
 */
export type Registry = z.infer<typeof registrySchema>;
//# sourceMappingURL=schema.d.ts.map