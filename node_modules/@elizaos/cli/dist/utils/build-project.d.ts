/**
 * Builds a project or plugin in the specified directory using the most appropriate available build method.
 *
 * Attempts to run the build script from `package.json` using `bun` or `npm`, or falls back to building
 * with the TypeScript compiler if a `tsconfig.json` is present. Throws an error if no suitable build
 * method is found or if all build attempts fail.
 *
 * note: cleanup on ctrl-c is handled by the calling function (creators.ts) not here
 *
 * @param cwd - The directory containing the project or plugin to build.
 * @param isPlugin - Set to `true` if building a plugin; otherwise, builds a project.
 *
 * @throws {Error} If no build method can be determined or if all build attempts fail.
 */
export declare function buildProject(cwd?: string, isPlugin?: boolean): Promise<void>;
//# sourceMappingURL=build-project.d.ts.map