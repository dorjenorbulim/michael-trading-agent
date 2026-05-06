import { UserConfiguration } from '../_types/index.js';
import AdzeGlobal from '../adze-global.js';
declare global {
    var $adzeGlobal: AdzeGlobal | undefined;
    var $ADZE_ENV: 'test' | 'dev' | undefined;
    interface Window {
        $adzeGlobal?: AdzeGlobal;
        $ADZE_ENV?: 'test' | 'dev';
    }
}
/**
 * Initialize the global log store for Adze. This is used for creating global configuration
 * overrides, storing labels, and optionally caching logs.
 */
export declare function setup<Meta extends Record<string, unknown> = Record<string, unknown>>(cfg?: UserConfiguration<Meta>): AdzeGlobal;
/**
 * Gets the global store context or initializes a new one if it doesn't exist.
 */
export declare function getGlobal(cfg?: UserConfiguration): AdzeGlobal;
/**
 * Removes the global log store from the environment.
 */
export declare function teardown(): void;
/**
 * Adze global store has been instantiated.
 */
export declare function isGlobalInitialized(global: unknown): global is AdzeGlobal;
/**
 * Validates that the current environment is `Window`.
 */
export declare function isBrowser(): boolean;
/**
 * Validates that the current environment is Deno.
 */
export declare function isDeno(): boolean;
/**
 * TypeGuard to determine if the env value is the Window object.
 */
export declare function envIsWindow(_: Window | typeof globalThis): _ is Window;
/**
 * Determines if the current environment is an Adze test environment.
 */
export declare function isTestEnvironment(): boolean;
/**
 * Validates the current environment is Chrome.
 */
export declare function isChrome(): boolean;
/**
 * Validates the current environment is Firefox.
 */
export declare function isFirefox(): boolean;
/**
 * Validates the current environment is Safari.
 */
export declare function isSafari(): boolean;
