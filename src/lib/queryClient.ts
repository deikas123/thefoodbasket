
import { QueryClient } from "@tanstack/react-query";

// Optimize React Query with better defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      networkMode: 'offlineFirst',
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});
