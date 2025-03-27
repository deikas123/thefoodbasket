
import { DeliveryOption } from "@/types";

// Define different delivery zones in Nairobi with varying delivery rates
export const deliveryZones = [
  { name: "Zone A - Nairobi CBD", baseRate: 250, expressRate: 450 },
  { name: "Zone B - Nairobi Suburbs", baseRate: 350, expressRate: 650 },
  { name: "Zone C - Outer Nairobi", baseRate: 450, expressRate: 850 },
];

// Mock geolocation data for delivery cost calculation
export const calculateDeliveryZone = (postalCode: string): number => {
  // This is a simplified example - in a real app, you would use 
  // a more robust system based on actual geo-data for Kenya
  const code = parseInt(postalCode, 10);
  
  if (isNaN(code)) return 2; // Default to the most expensive zone if invalid

  // Nairobi postal codes
  if (code >= 100 && code <= 199) return 0; // Zone A - CBD (00100, 00101, etc.)
  if (code >= 200 && code <= 299) return 1; // Zone B - Suburbs (00200, 00201, etc.)
  return 2; // Zone C - Outer Nairobi
};

interface DeliveryParams {
  postalCode: string;
  weight?: number; // in kg
  isExpress?: boolean;
  isScheduled?: boolean;
  scheduledDate?: Date;
}

// Calculate delivery cost based on multiple factors
export const calculateDeliveryCost = ({
  postalCode,
  weight = 5,
  isExpress = false,
  isScheduled = false,
  scheduledDate,
}: DeliveryParams): number => {
  const zoneIndex = calculateDeliveryZone(postalCode);
  const zone = deliveryZones[zoneIndex];
  
  // Base rate based on zone and delivery type
  let cost = isExpress ? zone.expressRate : zone.baseRate;
  
  // Weight surcharge - 50 KES per kg above 5kg
  if (weight > 5) {
    cost += (weight - 5) * 50;
  }
  
  // Scheduled delivery discount or premium
  if (isScheduled && scheduledDate) {
    const today = new Date();
    const daysDifference = Math.ceil(
      (scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDifference >= 3) {
      // Discount for advance scheduling
      cost *= 0.9; // 10% discount
    } else if (daysDifference < 1) {
      // Premium for same-day scheduled delivery
      cost *= 1.2; // 20% premium
    }
  }
  
  return parseFloat(cost.toFixed(2));
};

// Get available delivery options with calculated costs
export const getDeliveryOptions = (postalCode: string): DeliveryOption[] => {
  const standardCost = calculateDeliveryCost({ postalCode });
  const expressCost = calculateDeliveryCost({ postalCode, isExpress: true });
  const sameDayCost = calculateDeliveryCost({ 
    postalCode, 
    isExpress: true,
    isScheduled: true,
    scheduledDate: new Date()
  });

  return [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "Delivery within 2-3 business days",
      price: standardCost,
      estimatedDelivery: "2-3 business days",
      speed: "standard"
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "Delivery within 24 hours",
      price: expressCost,
      estimatedDelivery: "24 hours",
      speed: "express"
    },
    {
      id: "same-day",
      name: "Same-Day Delivery",
      description: "Delivery today (order before 2PM)",
      price: sameDayCost,
      estimatedDelivery: "Today",
      speed: "express"
    }
  ];
};

// Get delivery time slots
export const getDeliveryTimeSlots = (date: Date): { id: string; time: string }[] => {
  const today = new Date();
  const isToday = date.getDate() === today.getDate() && 
                  date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear();
  
  // If it's today, only show available slots based on current time
  const currentHour = today.getHours();
  
  // Standard time slots
  const timeSlots = [
    { id: "morning", time: "9:00 AM - 12:00 PM" },
    { id: "afternoon", time: "12:00 PM - 3:00 PM" },
    { id: "evening", time: "3:00 PM - 6:00 PM" },
  ];
  
  // Filter out passed time slots if delivery is for today
  if (isToday) {
    return timeSlots.filter(slot => {
      if (slot.id === "morning" && currentHour >= 9) return false;
      if (slot.id === "afternoon" && currentHour >= 12) return false;
      if (slot.id === "evening" && currentHour >= 15) return false;
      return true;
    });
  }
  
  return timeSlots;
};

// Group orders by delivery zone for hourly dispatch
export const groupOrdersByZone = (orders: any[]): Record<string, any[]> => {
  // Group orders by actual Nairobi neighborhoods
  return orders.reduce((groups: Record<string, any[]>, order) => {
    const zipCode = order.deliveryAddress.zipCode;
    const zoneIndex = calculateDeliveryZone(zipCode);
    const zoneName = deliveryZones[zoneIndex].name;
    
    if (!groups[zoneName]) {
      groups[zoneName] = [];
    }
    
    groups[zoneName].push(order);
    return groups;
  }, {});
};
