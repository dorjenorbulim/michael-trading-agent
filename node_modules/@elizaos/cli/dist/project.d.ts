import { AgentRuntime, Plugin, type ProjectAgent } from '@elizaos/core';
/**
 * Interface for a loaded project.
 */
export interface Project {
    agents: ProjectAgent[];
    dir: string;
    isPlugin?: boolean;
    pluginModule?: Plugin;
}
export interface LoadedProject {
    runtimes: AgentRuntime[];
    path: string;
    agents: ProjectAgent[];
}
/**
 * Loads a project from the specified directory.
 * @param {string} dir - The directory to load the project from.
 * @returns {Promise<Project>} A promise that resolves to the loaded project.
 */
export declare function loadProject(dir: string): Promise<Project>;
//# sourceMappingURL=project.d.ts.map