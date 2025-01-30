function usePrefetchInfiniteQuery.d() {
  return null;
}

import { DefaultError, QueryKey, FetchInfiniteQueryOptions, QueryClient } from '@tanstack/query-core';

declare function usePrefetchInfiniteQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown>(options: FetchInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>, queryClient?: QueryClient): void;

export { usePrefetchInfiniteQuery };


export default usePrefetchInfiniteQuery.d;
