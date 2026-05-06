export declare const NAV_BACK = "__back__";
export declare const NAV_NEXT = "__next__";
/**
 * Prompts the user with a text input and optional navigation options.
 * @param {string} label - The label to display to the user.
 * @param {string} initial - The initial value for the input (default is an empty string).
 * @param {(val: string) => true | string} validate - Optional validation function for the input.
 * @returns {Promise<string>} The user's input after processing any navigation commands.
 */
export declare function promptWithNav(label: string, initial?: string, validate?: (val: string) => true | string): Promise<string>;
/**
 * Prompts the user to enter multiple items for a specified field name.
 *
 * @param {string} fieldName - The name of the field being prompted for.
 * @param {string[]} initial - The initial values to display and allow the user to modify.
 * @returns {Promise<string[]>} The array of strings containing the user-entered values.
 */
export declare function promptForMultipleItems(fieldName: string, initial?: string[]): Promise<string[]>;
/**
 * Asynchronous function that prompts the user with a confirmation message and returns a boolean value based on their response.
 * @param {string} message - The message to display for the confirmation prompt.
 * @returns {Promise<boolean>} A Promise that resolves to a boolean value representing the user's confirmation choice.
 */
export declare function confirmAction(message: string): Promise<boolean>;
//# sourceMappingURL=cli-prompts.d.ts.map