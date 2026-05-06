import { type Character } from './types';
export declare function setAllowedEnvVars(vars: Set<string> | null): void;
export declare function getAllowedEnvVars(): Set<string> | null;
export declare function hasCharacterSecrets(character: Character): boolean;
/**
 * Merges process.env into character.settings.secrets with character values taking precedence.
 * Node.js-only - returns false in browser environments.
 */
export declare function setDefaultSecretsFromEnv(character: Character, options?: {
    skipEnvMerge?: boolean;
}): Promise<boolean>;
//# sourceMappingURL=secrets.d.ts.map