import AdzeGlobal from '../adze-global.js';
/**
 * Initialize the global log store for Adze. This is used for creating global configuration
 * overrides, storing labels, and optionally caching logs.
 */
export function setup(cfg) {
    globalThis.$adzeGlobal = new AdzeGlobal(cfg);
    return globalThis.$adzeGlobal;
}
/**
 * Gets the global store context or initializes a new one if it doesn't exist.
 */
export function getGlobal(cfg) {
    const store = globalThis.$adzeGlobal;
    if (isGlobalInitialized(store)) {
        return store;
    }
    const globalCtxt = new AdzeGlobal(cfg);
    globalThis.$adzeGlobal = globalCtxt;
    return globalCtxt;
}
/**
 * Removes the global log store from the environment.
 */
export function teardown() {
    if (isGlobalInitialized(globalThis.$adzeGlobal)) {
        delete globalThis.$adzeGlobal;
    }
}
/**
 * Adze global store has been instantiated.
 */
export function isGlobalInitialized(global) {
    return global instanceof AdzeGlobal;
}
/**
 * Validates that the current environment is `Window`.
 */
export function isBrowser() {
    return (typeof window !== 'undefined' &&
        typeof window.location !== 'undefined' &&
        typeof window.navigator.userAgent !== 'undefined' &&
        !isDeno());
}
/**
 * Validates that the current environment is Deno.
 */
export function isDeno() {
    // @ts-expect-error Deno is not defined in other environments
    return typeof Deno !== 'undefined';
}
/**
 * TypeGuard to determine if the env value is the Window object.
 */
export function envIsWindow(_) {
    return isBrowser();
}
/**
 * Determines if the current environment is an Adze test environment.
 */
export function isTestEnvironment() {
    let urlAdzeEnvTest = false;
    if (isBrowser()) {
        const urlParams = new URLSearchParams(globalThis.location.search);
        urlAdzeEnvTest = urlParams.get('ADZE_ENV') === 'test';
    }
    return globalThis.$ADZE_ENV === 'test' || urlAdzeEnvTest;
}
/**
 * Validates the current environment is Chrome.
 */
export function isChrome() {
    const _glbl = globalThis;
    if (envIsWindow(_glbl)) {
        return _glbl.navigator.userAgent.includes('Chrome');
    }
    return false;
}
/**
 * Validates the current environment is Firefox.
 */
export function isFirefox() {
    const _glbl = globalThis;
    if (envIsWindow(_glbl)) {
        return _glbl.navigator.userAgent.includes('Firefox');
    }
    return false;
}
/**
 * Validates the current environment is Safari.
 */
export function isSafari() {
    const _glbl = globalThis;
    if (envIsWindow(_glbl)) {
        return _glbl.navigator.userAgent.includes('Safari') && !isChrome();
    }
    return false;
}
