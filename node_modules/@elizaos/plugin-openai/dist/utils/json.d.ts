/**
 * Returns a function to repair JSON text
 */
export declare function getJsonRepairFunction(): (params: {
    text: string;
    error: unknown;
}) => Promise<string | null>;
