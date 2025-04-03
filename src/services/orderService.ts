
import { Order, OrderStatus } from "@/types/order";

// Mock orders data
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    userId: "USR-001",
    items: [
      {
        productId: "P001",
        name: "Organic Avocado",
        price: 2.99,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
      },
      {
        productId: "P003",
        name: "Organic Bananas",
        price: 1.99,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
      }
    ],
    status: "dispatched",
    deliveryAddress: {
      street: "123 Main St",
      city: "Nairobi",
      state: "Nairobi",
      zipCode: "00100",
      notes: "Apartment 4B, Ring bell twice"
    },
    customer: {
      name: "John Smith",
      phone: "+254 712 345 678",
      email: "john.smith@example.com"
    },
    deliveryMethod: {
      id: "express",
      name: "Express Delivery",
      price: 5.99,
      estimatedDelivery: "Today, 2-4 PM"
    },
    paymentMethod: {
      id: "mpesa",
      name: "M-Pesa"
    },
    subtotal: 7.97,
    deliveryFee: 5.99,
    total: 13.96,
    createdAt: "2023-09-20T10:30:00Z",
    updatedAt: "2023-09-20T11:15:00Z",
    estimatedDelivery: "Sep 20, 2023, 2-4 PM",
    tracking: {
      events: [
        {
          status: "pending",
          timestamp: "2023-09-20T10:30:00Z",
          description: "Order placed"
        },
        {
          status: "processing",
          timestamp: "2023-09-20T10:45:00Z",
          description: "Payment confirmed"
        },
        {
          status: "dispatched",
          timestamp: "2023-09-20T11:15:00Z",
          description: "Order has been dispatched from warehouse",
          location: "Central Warehouse, Nairobi"
        }
      ],
      driver: {
        id: "DRV-001",
        name: "John Doe",
        phone: "+254 712 345 678",
        photo: "https://randomuser.me/api/portraits/men/32.jpg"
      }
    }
  },
  {
    id: "ORD-002",
    userId: "USR-001",
    items: [
      {
        productId: "P005",
        name: "Fresh Milk",
        price: 3.49,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
      }
    ],
    status: "delivered",
    deliveryAddress: {
      street: "123 Main St",
      city: "Nairobi",
      state: "Nairobi",
      zipCode: "00100"
    },
    customer: {
      name: "John Smith",
      phone: "+254 712 345 678",
      email: "john.smith@example.com"
    },
    deliveryMethod: {
      id: "standard",
      name: "Standard Delivery",
      price: 2.99,
      estimatedDelivery: "1-2 days"
    },
    paymentMethod: {
      id: "card",
      name: "Credit/Debit Card"
    },
    subtotal: 6.98,
    deliveryFee: 2.99,
    total: 9.97,
    createdAt: "2023-09-18T15:20:00Z",
    updatedAt: "2023-09-19T14:30:00Z",
    estimatedDelivery: "Sep 19, 2023, 2-4 PM",
    tracking: {
      events: [
        {
          status: "pending",
          timestamp: "2023-09-18T15:20:00Z",
          description: "Order placed"
        },
        {
          status: "processing",
          timestamp: "2023-09-18T15:35:00Z",
          description: "Payment confirmed"
        },
        {
          status: "dispatched",
          timestamp: "2023-09-19T09:15:00Z",
          description: "Order has been dispatched from warehouse",
          location: "Central Warehouse, Nairobi"
        },
        {
          status: "out_for_delivery",
          timestamp: "2023-09-19T11:30:00Z",
          description: "Out for delivery",
          location: "Local Delivery Hub, Nairobi"
        },
        {
          status: "delivered",
          timestamp: "2023-09-19T14:30:00Z",
          description: "Delivered successfully",
          location: "123 Main St, Nairobi"
        }
      ],
      signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
      deliveredAt: "2023-09-19T14:30:00Z",
      driver: {
        id: "DRV-001",
        name: "John Doe",
        phone: "+254 712 345 678",
        photo: "https://randomuser.me/api/portraits/men/32.jpg"
      }
    }
  },
  {
    id: "ORD-003",
    userId: "USR-001",
    items: [
      {
        productId: "P012",
        name: "Organic Chicken",
        price: 8.99,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
      },
      {
        productId: "P010",
        name: "Brown Rice",
        price: 4.49,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
      }
    ],
    status: "pending",
    deliveryAddress: {
      street: "123 Main St",
      city: "Nairobi",
      state: "Nairobi",
      zipCode: "00100"
    },
    customer: {
      name: "John Smith",
      phone: "+254 712 345 678",
      email: "john.smith@example.com"
    },
    deliveryMethod: {
      id: "express",
      name: "Express Delivery",
      price: 5.99,
      estimatedDelivery: "Today, 2-4 PM"
    },
    paymentMethod: {
      id: "cod",
      name: "Cash on Delivery"
    },
    subtotal: 13.48,
    deliveryFee: 5.99,
    total: 19.47,
    createdAt: "2023-09-20T16:15:00Z",
    updatedAt: "2023-09-20T16:15:00Z",
    estimatedDelivery: "Sep 20, 2023, 6-8 PM",
    tracking: {
      events: [
        {
          status: "pending",
          timestamp: "2023-09-20T16:15:00Z",
          description: "Order placed"
        }
      ]
    }
  },
  {
    id: "ORD-004",
    userId: "USR-001",
    items: [
      {
        productId: "P020",
        name: "Fresh Oranges",
        price: 4.99,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1547514701-42782101795e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
      }
    ],
    status: "out_for_delivery",
    deliveryAddress: {
      street: "456 Park Avenue",
      city: "Nairobi",
      state: "Nairobi",
      zipCode: "00200",
      notes: "Ring the doorbell, door code: 1234"
    },
    customer: {
      name: "Sarah Johnson",
      phone: "+254 723 456 789",
      email: "sarah.j@example.com"
    },
    deliveryMethod: {
      id: "standard",
      name: "Standard Delivery",
      price: 2.99,
      estimatedDelivery: "Today, 5-7 PM"
    },
    paymentMethod: {
      id: "mpesa",
      name: "M-Pesa"
    },
    subtotal: 4.99,
    deliveryFee: 2.99,
    total: 7.98,
    createdAt: "2023-09-20T09:00:00Z",
    updatedAt: "2023-09-20T11:30:00Z",
    estimatedDelivery: "Sep 20, 2023, 5-7 PM",
    tracking: {
      events: [
        {
          status: "pending",
          timestamp: "2023-09-20T09:00:00Z",
          description: "Order placed"
        },
        {
          status: "processing",
          timestamp: "2023-09-20T09:15:00Z",
          description: "Payment confirmed"
        },
        {
          status: "dispatched",
          timestamp: "2023-09-20T10:00:00Z",
          description: "Order has been dispatched from warehouse",
          location: "Central Warehouse, Nairobi"
        },
        {
          status: "out_for_delivery",
          timestamp: "2023-09-20T11:30:00Z",
          description: "Out for delivery",
          location: "Local Delivery Hub, Nairobi"
        }
      ],
      driver: {
        id: "DRV-002",
        name: "Jane Smith",
        phone: "+254 734 567 890",
        photo: "https://randomuser.me/api/portraits/women/44.jpg"
      }
    }
  }
];

// Get all orders for a user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockOrders.filter(order => order.userId === userId);
};

// Get a specific order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 600));
  const order = mockOrders.find(order => order.id === orderId);
  return order || null;
};

// Create a new order
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newOrder: Order = {
    id: `ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    ...orderData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // In a real app, this would be saved to a database
  return newOrder;
};

// Update order status
export const updateOrderStatus = async (
  orderId: string, 
  status: OrderStatus, 
  additionalData?: { signature?: string; deliveredAt?: string }
): Promise<Order | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const orderIndex = mockOrders.findIndex(order => order.id === orderId);
  if (orderIndex === -1) return null;
  
  // Prepare tracking data with new event
  const tracking = {
    ...mockOrders[orderIndex].tracking,
    events: [
      ...(mockOrders[orderIndex].tracking?.events || []),
      {
        status,
        timestamp: new Date().toISOString(),
        description: getStatusDescription(status),
        location: "Current Location" // In a real app, this would be from GPS
      }
    ]
  };
  
  // Add signature and delivery timestamp if provided
  if (additionalData?.signature) {
    tracking.signature = additionalData.signature;
  }
  
  if (additionalData?.deliveredAt) {
    tracking.deliveredAt = additionalData.deliveredAt;
  }
  
  const updatedOrder = {
    ...mockOrders[orderIndex],
    status,
    updatedAt: new Date().toISOString(),
    tracking
  };
  
  // In a real app, this would update the database
  mockOrders[orderIndex] = updatedOrder;
  
  return updatedOrder;
};

// Helper function to get status description
const getStatusDescription = (status: OrderStatus): string => {
  switch (status) {
    case "pending": return "Order placed";
    case "processing": return "Order is being processed";
    case "dispatched": return "Order has been dispatched";
    case "out_for_delivery": return "Order is out for delivery";
    case "delivered": return "Order has been delivered";
    case "cancelled": return "Order has been cancelled";
    default: return "Status updated";
  }
};

// Cancel an order
export const cancelOrder = async (orderId: string): Promise<Order | null> => {
  return updateOrderStatus(orderId, "cancelled");
};
