function infiniteQueryBehavior.d() {
  return null;
}

import { b3 as QueryBehavior, a0 as InfiniteData, a6 as InfiniteQueryPageParamsOptions } from '@/hydration-HsNFcW1O.js';
import './removable.js';
import './subscribable.js';

declare function infiniteQueryBehavior<TQueryFnData, TError, TData, TPageParam>(pages?: number): QueryBehavior<TQueryFnData, TError, InfiniteData<TData, TPageParam>>;
/**
 * Checks if there is a next page.
 */
declare function hasNextPage(options: InfiniteQueryPageParamsOptions<any, any>, data?: InfiniteData<unknown>): boolean;
/**
 * Checks if there is a previous page.
 */
declare function hasPreviousPage(options: InfiniteQueryPageParamsOptions<any, any>, data?: InfiniteData<unknown>): boolean;

export { hasNextPage, hasPreviousPage, infiniteQueryBehavior };


export default infiniteQueryBehavior.d;
