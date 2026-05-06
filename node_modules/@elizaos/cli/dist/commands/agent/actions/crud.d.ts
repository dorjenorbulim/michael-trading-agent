import type { OptionValues } from 'commander';
/**
 * Parse error response and throw appropriate error
 * @param response - The fetch Response object
 * @param defaultMessage - Default error message if JSON parsing fails
 */
/**
 * Get command implementation - retrieves and displays agent details
 */
export declare function getAgent(opts: OptionValues): Promise<void>;
/**
 * Remove command implementation - deletes an agent
 */
export declare function removeAgent(opts: OptionValues): Promise<void>;
/**
 * Clear memories command implementation - clears all memories for an agent
 */
export declare function clearAgentMemories(opts: OptionValues): Promise<void>;
/**
 * Set command implementation - updates agent configuration
 */
export declare function setAgentConfig(opts: OptionValues): Promise<void>;
//# sourceMappingURL=crud.d.ts.map