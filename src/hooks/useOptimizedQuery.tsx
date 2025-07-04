
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
    // Optimized defaults for better performance
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000), // Faster retries
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
    staleTime: 1000 * 60 * 10, // 10 minutes for products
    gcTime: 1000 * 60 * 15,    // 15 minutes garbage collection
    ...options,
  });
}

/**
 * Hook for frequently changing data with shorter cache times
 */
export function useFastQuery<TData>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, Error, TData, string[]>
): UseQueryResult<TData, Error> {
  return useOptimizedQuery(queryKey, queryFn, {
    staleTime: 1000 * 30, // 30 seconds for fast-changing data
    gcTime: 1000 * 60 * 2, // 2 minutes garbage collection
    ...options,
  });
}
