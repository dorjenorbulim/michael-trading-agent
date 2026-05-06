declare const styles_raw: readonly ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "gray", "blackBright", "redBright", "greenBright", "yellowBright", "blueBright", "magentaBright", "cyanBright", "whiteBright", "bgBlack", "bgRed", "bgGreen", "bgYellow", "bgBlue", "bgMagenta", "bgCyan", "bgWhite", "bgBlackBright", "bgRedBright", "bgGreenBright", "bgYellowBright", "bgBlueBright", "bgMagentaBright", "bgCyanBright", "bgWhiteBright", "reset", "bold", "dim", "italic", "underline", "inverse", "hidden", "strikethrough"];
type StylesRaw = typeof styles_raw;
/**
 * String union representing all possible Console styles.
 */
export type ConsoleStyle = StylesRaw[number];
/**
 * Immutable array of all possible console styles.
 */
export declare const console_styles: readonly ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "gray", "blackBright", "redBright", "greenBright", "yellowBright", "blueBright", "magentaBright", "cyanBright", "whiteBright", "bgBlack", "bgRed", "bgGreen", "bgYellow", "bgBlue", "bgMagenta", "bgCyan", "bgWhite", "bgBlackBright", "bgRedBright", "bgGreenBright", "bgYellowBright", "bgBlueBright", "bgMagentaBright", "bgCyanBright", "bgWhiteBright", "reset", "bold", "dim", "italic", "underline", "inverse", "hidden", "strikethrough"];
export {};
