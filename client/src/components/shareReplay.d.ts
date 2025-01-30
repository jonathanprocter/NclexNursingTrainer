function shareReplay.d() {
  return null;
}

import { MonoTypeOperatorFunction, SchedulerLike } from '@/types';
export interface ShareReplayConfig {
    bufferSize?: number;
    windowTime?: number;
    refCount: boolean;
    scheduler?: SchedulerLike;
}
export declare function shareReplay<T>(config: ShareReplayConfig): MonoTypeOperatorFunction<T>;
export declare function shareReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
//# sourceMappingURL=shareReplay.d.ts.map

export default shareReplay.d;
