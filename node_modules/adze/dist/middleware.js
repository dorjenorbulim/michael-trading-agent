import { isBrowser } from './index.js';
/**
 * Middleware abstract class that can be extended to create custom middleware.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Middleware {
    /**
     * The target environment for this middleware.
     *
     * This instructs the middleware to only load dependencies for the specified environment.
     */
    targetEnvironment;
    /**
     * The environment that the middleware is running in.
     */
    environment = isBrowser() ? 'browser' : 'server';
    /**
     * Array of asynchronous dependency loaders.
     */
    dependencyLoaders = [];
    constructor(targetEnvironment) {
        this.targetEnvironment = targetEnvironment ?? 'both';
        if (!isBrowser() &&
            (this.targetEnvironment === 'server' || this.targetEnvironment === 'both')) {
            this.dependencyLoaders.push(this.loadServerDependencies());
        }
        if (isBrowser() &&
            (this.targetEnvironment === 'browser' || this.targetEnvironment === 'both')) {
            this.dependencyLoaders.push(this.loadBrowserDependencies());
        }
    }
    /**
     * Load the dependencies for this middleware.
     */
    async load() {
        await Promise.all(this.dependencyLoaders);
    }
    /**
     * Load dependencies for the server environment.
     */
    async loadServerDependencies() {
        /* noop */
    }
    /**
     * Load dependencies for the browser environment.
     */
    async loadBrowserDependencies() {
        /* noop */
    }
}
