import { Configuration } from '../configuration.js';
import structuredClone from '@ungap/structured-clone';
/**
 * A mixin function for creating a sealed log instance that inherits properties from the parent.
 */
export function SealedLog(Base, cfg, mods, modifierQueue) {
    const { formatters, middleware = [], ...cfgWithoutFormatters } = cfg.exportValues();
    const sealing = class Sealing extends Base {
        _cfg = new Configuration({
            ...structuredClone(cfgWithoutFormatters),
            formatters: { ...formatters },
            middleware: [...middleware],
        });
        _modifierData = structuredClone(mods);
        modifierQueue = [...modifierQueue];
    };
    const sealed = sealing;
    return sealed;
}
