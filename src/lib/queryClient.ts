
import { QueryClient } from "@tanstack/react-query";

// Optimize React Query with better defaults for performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      networkMode: 'offlineFirst',
      // Reduce initial data fetching
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Function to prefetch only the most critical data
export const prefetchCriticalData = async () => {
  // Only prefetch categories as they're needed immediately
  try {
    await queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('categories')
          .select('*')
          .limit(10);
        return data || [];
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  } catch (error) {
    console.log('Failed to prefetch categories:', error);
  }
};
