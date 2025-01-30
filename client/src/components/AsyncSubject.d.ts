function AsyncSubject.d() {
  return null;
}

import { Subject } from '@/Subject';
/**
 * A variant of Subject that only emits a value when it completes. It will emit
 * its latest value to all its observers on completion.
 *
 * @class AsyncSubject<T>
 */
export declare class AsyncSubject<T> extends Subject<T> {
    private _value;
    private _hasValue;
    private _isComplete;
    next(value: T): void;
    complete(): void;
}
//# sourceMappingURL=AsyncSubject.d.ts.map

export default AsyncSubject.d;
