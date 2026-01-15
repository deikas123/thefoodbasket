
// Route optimization service for delivery planning
// Uses a simple greedy nearest-neighbor algorithm for route optimization

export interface DeliveryPoint {
  orderId: string;
  customerName: string;
  address: {
    street: string;
    city: string;
    location?: { lat: number; lng: number };
  };
  deliveryMethod: string;
  priority: number; // Express = 10, Standard = 5, Scheduled = 1
  estimatedTime: number; // minutes
}

export interface OptimizedRoute {
  stops: DeliveryPoint[];
  totalDistance: number; // km
  totalTime: number; // minutes
  efficiency: number; // percentage improvement
}

// Haversine formula to calculate distance between two points
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Assign priority based on delivery method
export const getDeliveryPriority = (deliveryMethod: string): number => {
  const method = deliveryMethod.toLowerCase();
  if (method.includes('express') || method.includes('urgent')) return 10;
  if (method.includes('same day') || method.includes('sameday')) return 8;
  if (method.includes('standard') || method.includes('normal')) return 5;
  if (method.includes('scheduled')) return 3;
  return 5;
};

// Estimate delivery time based on method
export const estimateDeliveryTime = (deliveryMethod: string): number => {
  const method = deliveryMethod.toLowerCase();
  if (method.includes('express')) return 5;
  if (method.includes('standard')) return 10;
  return 8;
};

// Nearest neighbor algorithm with priority weighting
const nearestNeighborWithPriority = (
  points: DeliveryPoint[],
  startLat: number,
  startLon: number
): DeliveryPoint[] => {
  if (points.length === 0) return [];
  
  const result: DeliveryPoint[] = [];
  const unvisited = [...points];
  let currentLat = startLat;
  let currentLon = startLon;
  
  while (unvisited.length > 0) {
    let bestIndex = 0;
    let bestScore = Infinity;
    
    for (let i = 0; i < unvisited.length; i++) {
      const point = unvisited[i];
      const loc = point.address.location;
      
      if (loc) {
        const distance = calculateDistance(currentLat, currentLon, loc.lat, loc.lng);
        // Weight: distance / priority (lower is better, higher priority reduces effective distance)
        const score = distance / point.priority;
        
        if (score < bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      } else {
        // If no location, prioritize by priority alone
        const score = 1000 / point.priority;
        if (score < bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      }
    }
    
    const next = unvisited.splice(bestIndex, 1)[0];
    result.push(next);
    
    if (next.address.location) {
      currentLat = next.address.location.lat;
      currentLon = next.address.location.lng;
    }
  }
  
  return result;
};

// Calculate total route distance
const calculateTotalDistance = (points: DeliveryPoint[], startLat: number, startLon: number): number => {
  let total = 0;
  let prevLat = startLat;
  let prevLon = startLon;
  
  for (const point of points) {
    if (point.address.location) {
      total += calculateDistance(prevLat, prevLon, point.address.location.lat, point.address.location.lng);
      prevLat = point.address.location.lat;
      prevLon = point.address.location.lng;
    }
  }
  
  return Math.round(total * 10) / 10;
};

// Main optimization function
export const optimizeDeliveryRoute = (
  orders: Array<{
    id: string;
    delivery_address: any;
    delivery_method: any;
  }>,
  startLocation = { lat: -1.2921, lng: 36.8219 } // Default: Nairobi center
): OptimizedRoute => {
  // Convert orders to delivery points
  const points: DeliveryPoint[] = orders.map(order => {
    const address = order.delivery_address as any;
    const method = (order.delivery_method as any)?.name || 'Standard';
    
    return {
      orderId: order.id,
      customerName: address?.fullName || 'Customer',
      address: {
        street: address?.street || '',
        city: address?.city || '',
        location: address?.location
      },
      deliveryMethod: method,
      priority: getDeliveryPriority(method),
      estimatedTime: estimateDeliveryTime(method)
    };
  });
  
  // Sort by priority first (express orders should be considered first)
  points.sort((a, b) => b.priority - a.priority);
  
  // Calculate original distance (in priority order)
  const originalDistance = calculateTotalDistance(points, startLocation.lat, startLocation.lng);
  
  // Optimize route
  const optimizedStops = nearestNeighborWithPriority(points, startLocation.lat, startLocation.lng);
  const optimizedDistance = calculateTotalDistance(optimizedStops, startLocation.lat, startLocation.lng);
  
  // Calculate total time
  const totalTime = optimizedStops.reduce((sum, stop) => sum + stop.estimatedTime, 0) +
    (optimizedDistance * 3); // ~3 min per km average
  
  // Calculate efficiency improvement
  const efficiency = originalDistance > 0 
    ? Math.round((1 - optimizedDistance / originalDistance) * 100)
    : 0;
  
  return {
    stops: optimizedStops,
    totalDistance: optimizedDistance,
    totalTime: Math.round(totalTime),
    efficiency: Math.max(0, efficiency)
  };
};

// Group orders by zone/area for efficient batch delivery
export const groupOrdersByZone = (
  orders: Array<{
    id: string;
    delivery_address: any;
  }>
): Map<string, typeof orders> => {
  const zones = new Map<string, typeof orders>();
  
  for (const order of orders) {
    const address = order.delivery_address as any;
    const city = address?.city || 'Unknown';
    
    if (!zones.has(city)) {
      zones.set(city, []);
    }
    zones.get(city)!.push(order);
  }
  
  return zones;
};

// Estimate arrival times for each stop
export const estimateArrivalTimes = (
  route: OptimizedRoute,
  startTime = new Date()
): Array<{ orderId: string; estimatedArrival: Date }> => {
  let currentTime = new Date(startTime);
  const arrivals: Array<{ orderId: string; estimatedArrival: Date }> = [];
  
  for (let i = 0; i < route.stops.length; i++) {
    const stop = route.stops[i];
    
    // Add travel time (assuming average 20 km/h in city)
    if (i > 0) {
      const prevStop = route.stops[i - 1];
      if (stop.address.location && prevStop.address.location) {
        const distance = calculateDistance(
          prevStop.address.location.lat,
          prevStop.address.location.lng,
          stop.address.location.lat,
          stop.address.location.lng
        );
        currentTime = new Date(currentTime.getTime() + (distance / 20) * 60 * 60 * 1000);
      } else {
        currentTime = new Date(currentTime.getTime() + 10 * 60 * 1000); // Default 10 min
      }
    }
    
    // Add delivery time
    currentTime = new Date(currentTime.getTime() + stop.estimatedTime * 60 * 1000);
    
    arrivals.push({
      orderId: stop.orderId,
      estimatedArrival: new Date(currentTime)
    });
  }
  
  return arrivals;
};
