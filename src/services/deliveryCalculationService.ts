
import { supabase } from "@/integrations/supabase/client";

interface Location {
  lat: number;
  lng: number;
}

interface DeliveryCalculationParams {
  deliveryLocation: Location;
  orderTotal: number;
}

interface DeliveryCalculationResult {
  distance: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  estimatedTime: string;
}

// Calculate distance between two points using Haversine formula
const calculateDistance = (point1: Location, point2: Location): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

export const calculateDeliveryFee = async (
  params: DeliveryCalculationParams,
  deliveryOptionId?: string
): Promise<DeliveryCalculationResult> => {
  try {
    // Get delivery settings
    const { data: settingsData } = await supabase
      .from('website_sections')
      .select('settings')
      .eq('type', 'delivery_settings')
      .single();

    const settings = settingsData?.settings || {
      minimum_checkout_amount: 50,
      warehouse_location: { lat: -1.2921, lng: 36.8219 } // Nairobi default
    };

    // Get delivery option details
    let deliveryOption;
    if (deliveryOptionId) {
      const { data } = await supabase
        .from('delivery_options')
        .select('*')
        .eq('id', deliveryOptionId)
        .single();
      deliveryOption = data;
    } else {
      // Get default standard delivery option
      const { data } = await supabase
        .from('delivery_options')
        .select('*')
        .eq('active', true)
        .order('base_price')
        .limit(1);
      deliveryOption = data?.[0];
    }

    if (!deliveryOption) {
      throw new Error('No delivery option found');
    }

    // Calculate distance
    const distance = calculateDistance(
      settings.warehouse_location,
      params.deliveryLocation
    );

    // Calculate delivery fee
    let deliveryFee = deliveryOption.base_price;
    if (deliveryOption.price_per_km && distance > 0) {
      deliveryFee += distance * deliveryOption.price_per_km;
    }

    // Check for free delivery
    const isFreeDelivery = params.orderTotal >= settings.minimum_checkout_amount;
    if (isFreeDelivery) {
      deliveryFee = 0;
    }

    // Estimate delivery time based on distance and option type
    let estimatedTime = `${deliveryOption.estimated_delivery_days} days`;
    if (deliveryOption.is_express) {
      estimatedTime = distance <= 10 ? 'Same day' : '1 day';
    } else {
      if (distance <= 5) {
        estimatedTime = '1-2 days';
      } else if (distance <= 15) {
        estimatedTime = '2-3 days';
      } else {
        estimatedTime = `${deliveryOption.estimated_delivery_days} days`;
      }
    }

    return {
      distance,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      isFreeDelivery,
      estimatedTime
    };

  } catch (error) {
    console.error('Error calculating delivery fee:', error);
    // Return default values on error
    return {
      distance: 0,
      deliveryFee: 5.99,
      isFreeDelivery: false,
      estimatedTime: '2-3 days'
    };
  }
};

// Get coordinates from address (mock implementation - in production, use a geocoding service)
export const getCoordinatesFromAddress = async (address: string): Promise<Location> => {
  // Mock implementation - returns Nairobi coordinates with slight variation
  // In production, you would use Google Maps Geocoding API or similar
  const baseLocation = { lat: -1.2921, lng: 36.8219 };
  const variation = 0.1; // Roughly 10km variation
  
  return {
    lat: baseLocation.lat + (Math.random() - 0.5) * variation,
    lng: baseLocation.lng + (Math.random() - 0.5) * variation
  };
};
