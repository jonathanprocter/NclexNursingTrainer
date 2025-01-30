function proxy-signals.d() {
  return null;
}

/// <reference types="node" resolution-mode="require"/>
import { type ChildProcess } from 'child_process';
/**
 * Starts forwarding signals to `child` through `parent`.
 */
export declare const proxySignals: (child: ChildProcess) => () => void;
//# sourceMappingURL=proxy-signals.d.ts.map

export default proxy-signals.d;
