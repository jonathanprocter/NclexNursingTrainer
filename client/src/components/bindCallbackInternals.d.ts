function bindCallbackInternals.d() {
  return null;
}

import { SchedulerLike } from '@/types';
import { Observable } from '@/Observable';
export declare function bindCallbackInternals(isNodeStyle: boolean, callbackFunc: any, resultSelector?: any, scheduler?: SchedulerLike): (...args: any[]) => Observable<unknown>;
//# sourceMappingURL=bindCallbackInternals.d.ts.map

export default bindCallbackInternals.d;
