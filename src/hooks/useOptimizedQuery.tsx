
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

/**
 * A wrapper hook around useQuery that provides optimized defaults
 * for better performance and caching behavior.
 */
export function useOptimizedQuery<TData, TError = Error>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError, TData, string[]>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey,
    queryFn,
    // Default optimization settings
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    // Override with custom options
    ...options,
  });
}

/**
 * Hook to fetch product data with optimized settings 
 */
export function useProductQuery<TData>(
  queryFn: () => Promise<TData>,
  queryKey: string[] = ['products'],
  options?: UseQueryOptions<TData, Error, TData, string[]>
): UseQueryResult<TData, Error> {
  return useOptimizedQuery(queryKey, queryFn, {
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
}
