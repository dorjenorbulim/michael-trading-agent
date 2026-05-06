#!/usr/bin/env bun
/**
 * Generate version.ts file at build time with CLI package information
 * This eliminates the need to read package.json at runtime
 *
 * NOTE: This script is smart about updates - it only rewrites the file if the
 * version, name, or description have changed. This prevents unnecessary file
 * modifications that could trigger watch mode rebuild loops.
 */
export {};
//# sourceMappingURL=generate-version.d.ts.map