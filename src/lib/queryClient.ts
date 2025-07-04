
import { QueryClient } from "@tanstack/react-query";

// Optimize React Query with better defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      // Add data prefetching
      networkMode: 'offlineFirst',
      // Improve cache hit rate
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Function to prefetch critical data
export const prefetchCriticalData = () => {
  queryClient.prefetchQuery({
    queryKey: ["categories"],
    queryFn: () => fetch('/api/categories').then(res => res.json()),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });
};
