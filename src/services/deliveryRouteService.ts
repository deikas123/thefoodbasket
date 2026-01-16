import { supabase } from "@/integrations/supabase/client";

export interface DeliveryRoute {
  id: string;
  rider_id: string;
  date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  total_distance: number | null;
  total_duration: number | null;
  optimized_order: string[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithLocation {
  id: string;
  customer_latitude: number | null;
  customer_longitude: number | null;
  delivery_address: any;
  delivery_method: any;
  status: string;
  priority: number;
}

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Optimize route using nearest neighbor algorithm with priority weighting
export const optimizeDeliveryRoute = (
  orders: OrderWithLocation[],
  warehouseLocation: { lat: number; lng: number }
): { optimizedOrder: string[]; totalDistance: number } => {
  if (orders.length === 0) return { optimizedOrder: [], totalDistance: 0 };
  
  // Filter orders with valid coordinates
  const validOrders = orders.filter(o => 
    o.customer_latitude && o.customer_longitude
  );
  
  if (validOrders.length === 0) {
    return { optimizedOrder: orders.map(o => o.id), totalDistance: 0 };
  }
  
  // Sort by priority first (express deliveries first)
  const sortedByPriority = [...validOrders].sort((a, b) => {
    const aPriority = a.delivery_method?.is_express ? 0 : 1;
    const bPriority = b.delivery_method?.is_express ? 0 : 1;
    return aPriority - bPriority;
  });
  
  // Nearest neighbor algorithm
  const visited = new Set<string>();
  const route: string[] = [];
  let totalDistance = 0;
  let currentLat = warehouseLocation.lat;
  let currentLng = warehouseLocation.lng;
  
  while (visited.size < sortedByPriority.length) {
    let nearestOrder: OrderWithLocation | null = null;
    let nearestDistance = Infinity;
    
    for (const order of sortedByPriority) {
      if (visited.has(order.id)) continue;
      
      const distance = calculateDistance(
        currentLat,
        currentLng,
        order.customer_latitude!,
        order.customer_longitude!
      );
      
      // Apply priority weight (express orders get distance penalty reduced)
      const priorityWeight = order.delivery_method?.is_express ? 0.5 : 1;
      const weightedDistance = distance * priorityWeight;
      
      if (weightedDistance < nearestDistance) {
        nearestDistance = weightedDistance;
        nearestOrder = order;
      }
    }
    
    if (nearestOrder) {
      visited.add(nearestOrder.id);
      route.push(nearestOrder.id);
      totalDistance += calculateDistance(
        currentLat,
        currentLng,
        nearestOrder.customer_latitude!,
        nearestOrder.customer_longitude!
      );
      currentLat = nearestOrder.customer_latitude!;
      currentLng = nearestOrder.customer_longitude!;
    }
  }
  
  // Add orders without coordinates at the end
  const ordersWithoutCoords = orders.filter(o => 
    !o.customer_latitude || !o.customer_longitude
  );
  route.push(...ordersWithoutCoords.map(o => o.id));
  
  return { 
    optimizedOrder: route, 
    totalDistance: Math.round(totalDistance * 100) / 100 
  };
};

export const createDeliveryRoute = async (
  riderId: string,
  orderIds: string[]
): Promise<DeliveryRoute | null> => {
  // Get orders with locations
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, customer_latitude, customer_longitude, delivery_address, delivery_method, status')
    .in('id', orderIds);
    
  if (ordersError || !orders) {
    console.error('Error fetching orders:', ordersError);
    return null;
  }
  
  // Get warehouse location from settings
  const { data: settings } = await supabase
    .from('website_sections')
    .select('settings')
    .eq('type', 'delivery_settings')
    .single();
    
  const warehouseLocation = settings?.settings?.warehouse_location || { lat: -1.2921, lng: 36.8219 };
  
  // Optimize route
  const { optimizedOrder, totalDistance } = optimizeDeliveryRoute(
    orders as OrderWithLocation[],
    warehouseLocation
  );
  
  // Estimate duration (assume average 15 min per delivery + 2 min per km)
  const totalDuration = (orders.length * 15) + (totalDistance * 2);
  
  // Create route
  const { data: route, error: routeError } = await supabase
    .from('delivery_routes')
    .insert({
      rider_id: riderId,
      date: new Date().toISOString().split('T')[0],
      status: 'planned',
      total_distance: totalDistance,
      total_duration: Math.round(totalDuration),
      optimized_order: optimizedOrder
    })
    .select()
    .single();
    
  if (routeError) {
    console.error('Error creating route:', routeError);
    return null;
  }
  
  // Update orders with route info
  for (let i = 0; i < optimizedOrder.length; i++) {
    await supabase
      .from('orders')
      .update({
        delivery_route_id: route.id,
        route_sequence: i + 1
      })
      .eq('id', optimizedOrder[i]);
  }
  
  return route;
};

export const getRiderRoute = async (riderId: string, date?: string): Promise<DeliveryRoute | null> => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('delivery_routes')
    .select('*')
    .eq('rider_id', riderId)
    .eq('date', targetDate)
    .single();
    
  if (error) {
    if (error.code !== 'PGRST116') { // Not found is OK
      console.error('Error fetching route:', error);
    }
    return null;
  }
  
  return data;
};

export const startRoute = async (routeId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('delivery_routes')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', routeId);
    
  if (error) {
    console.error('Error starting route:', error);
    return false;
  }
  
  return true;
};

export const completeRoute = async (routeId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('delivery_routes')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', routeId);
    
  if (error) {
    console.error('Error completing route:', error);
    return false;
  }
  
  return true;
};

export const calculateOrderDeliveryDistance = async (
  orderId: string,
  customerLat: number,
  customerLng: number
): Promise<number> => {
  // Get warehouse location
  const { data: settings } = await supabase
    .from('website_sections')
    .select('settings')
    .eq('type', 'delivery_settings')
    .single();
    
  const warehouseLocation = settings?.settings?.warehouse_location || { lat: -1.2921, lng: 36.8219 };
  
  const distance = calculateDistance(
    warehouseLocation.lat,
    warehouseLocation.lng,
    customerLat,
    customerLng
  );
  
  // Update order with distance and coordinates
  await supabase
    .from('orders')
    .update({
      delivery_distance: Math.round(distance * 100) / 100,
      customer_latitude: customerLat,
      customer_longitude: customerLng
    })
    .eq('id', orderId);
    
  return distance;
};
