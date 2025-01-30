function runnable-query.d() {
  return null;
}

import type { Dialect } from '@/column-builder.js';
export interface RunnableQuery<T, TDialect extends Dialect> {
    readonly _: {
        readonly dialect: TDialect;
        readonly result: T;
    };
}


export default runnable-query.d;
