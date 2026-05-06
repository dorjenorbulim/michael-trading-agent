import { Modifier, ModifierData } from '../index.js';
import { Configuration } from '../configuration.js';
import Log from '../log.js';
/**
 * Required type for creating mixins in TypeScript.
 */
type Constructor = new (...args: any[]) => {};
/**
 * A mixin function for creating a sealed log instance that inherits properties from the parent.
 */
export declare function SealedLog<N extends string, Msg, TBase extends Constructor = Constructor>(Base: TBase, cfg: Configuration, mods: ModifierData, modifierQueue: Modifier[]): Log<N, Msg>;
export {};
