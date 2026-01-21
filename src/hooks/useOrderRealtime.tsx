
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseOrderRealtimeOptions {
  queryKeys: string[][];
  statuses?: string[];
  assignedTo?: string;
  showToasts?: boolean;
  toastMessages?: {
    insert?: string;
    update?: string;
    delete?: string;
  };
}

/**
 * Hook to subscribe to real-time order updates
 * Automatically invalidates specified query keys when orders change
 */
export const useOrderRealtime = ({
  queryKeys,
  statuses,
  assignedTo,
  showToasts = true,
  toastMessages = {}
}: UseOrderRealtimeOptions) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Build filter for the subscription
    let filter = '';
    if (statuses?.length) {
      filter = `status=in.(${statuses.join(',')})`;
    }

    const channelName = `orders-realtime-${queryKeys.map(k => k.join('-')).join('_')}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          ...(filter ? { filter } : {})
        },
        (payload) => {
          console.log('Order realtime update:', payload.eventType, payload);
          
          const newOrder = payload.new as any;
          const oldOrder = payload.old as any;
          
          // Check if this update is relevant (if assignedTo filter is set)
          if (assignedTo && payload.eventType !== 'DELETE') {
            const isRelevant = 
              newOrder?.assigned_to === assignedTo ||
              (statuses?.includes(newOrder?.status) && !newOrder?.assigned_to);
            
            if (!isRelevant) {
              // Check if order was previously assigned to this user
              if (oldOrder?.assigned_to !== assignedTo) {
                return; // Skip irrelevant updates
              }
            }
          }
          
          // Invalidate all specified query keys
          queryKeys.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
          });
          
          // Show toast notifications
          if (showToasts) {
            switch (payload.eventType) {
              case 'INSERT':
                if (toastMessages.insert) {
                  toast.info(toastMessages.insert, {
                    icon: '📦',
                    duration: 3000,
                  });
                }
                break;
              case 'UPDATE':
                // Show status change notifications
                if (oldOrder?.status !== newOrder?.status) {
                  const statusMessages: Record<string, string> = {
                    pending: 'New order received',
                    processing: 'Order is being packed',
                    dispatched: 'Order ready for pickup',
                    out_for_delivery: 'Order is out for delivery',
                    delivered: 'Order delivered successfully',
                    cancelled: 'Order was cancelled'
                  };
                  const message = statusMessages[newOrder?.status] || toastMessages.update;
                  if (message) {
                    toast.info(message, {
                      description: `Order #${newOrder?.id?.slice(0, 8)}`,
                      icon: newOrder?.status === 'delivered' ? '✅' : '🔄',
                      duration: 3000,
                    });
                  }
                }
                break;
              case 'DELETE':
                if (toastMessages.delete) {
                  toast.info(toastMessages.delete, {
                    icon: '🗑️',
                    duration: 3000,
                  });
                }
                break;
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription:', channelName);
      supabase.removeChannel(channel);
    };
  }, [queryClient, queryKeys, statuses, assignedTo, showToasts, toastMessages]);
};

export default useOrderRealtime;
