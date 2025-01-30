function useMutation.d() {
  return null;
}

import { UseMutationOptions, UseMutationResult } from '@/types.js';
import { DefaultError, QueryClient } from '@tanstack/query-core';

declare function useMutation<TData = unknown, TError = DefaultError, TVariables = void, TContext = unknown>(options: UseMutationOptions<TData, TError, TVariables, TContext>, queryClient?: QueryClient): UseMutationResult<TData, TError, TVariables, TContext>;

export { useMutation };


export default useMutation.d;
