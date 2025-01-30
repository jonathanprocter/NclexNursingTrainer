function useQuery.d() {
  return null;
}

import { DefaultError, QueryKey, QueryClient } from '@tanstack/query-core';
import { DefinedUseQueryResult, UseQueryResult, UseQueryOptions } from '@/types.js';
import { DefinedInitialDataOptions, UndefinedInitialDataOptions } from '@/queryOptions.js';

declare function useQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<TData, TError>;
declare function useQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): UseQueryResult<TData, TError>;
declare function useQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): UseQueryResult<TData, TError>;

export { useQuery };


export default useQuery.d;
