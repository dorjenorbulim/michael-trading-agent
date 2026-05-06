/**
 * Copy a directory recursively
 */
/**
 * Asynchronously copies the contents of a directory from a source path to a destination path, excluding specified files and directories.
 * If the destination directory does not exist, it will be created.
 *
 * @param {string} src - The path to the source directory.
 * @param {string} dest - The path to the destination directory.
 * @param {string[]} [exclude=[]] - An array of file and directory names to exclude from the copy operation.
 * @returns {Promise<void>} A Promise that resolves when the copy operation is complete.
 */
export declare function copyDir(src: string, dest: string, exclude?: string[]): Promise<void>;
/**
 * Copy a project or plugin template to target directory
 */
export declare function copyTemplate(templateType: 'project' | 'project-starter' | 'project-tee-starter' | 'plugin' | 'plugin-quick', targetDir: string): Promise<void>;
//# sourceMappingURL=copy-template.d.ts.map