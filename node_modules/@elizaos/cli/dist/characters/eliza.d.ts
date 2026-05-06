import { type Character } from '@elizaos/core';
/**
 * Get the Eliza character with plugins configured based on environment variables.
 * Uses buildCharacterPlugins from @elizaos/core to determine which plugins to load.
 *
 * @param env - Environment object to check for API keys (defaults to process.env)
 * @returns The Eliza character with appropriate plugins for the current environment
 */
export declare function getDefaultCharacter(env?: Record<string, string | undefined>): Character;
/**
 * Legacy export for backward compatibility.
 * Note: This will use plugins based on current process.env.
 * For explicit environment control, use getDefaultCharacter(env) instead.
 */
export declare const character: Character;
//# sourceMappingURL=eliza.d.ts.map