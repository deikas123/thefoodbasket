
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

// Sample data - would come from an API in a real app
const sampleOrders: Order[] = [
  {
    id: "ord-001",
    userId: "user1",
    items: [
      { productId: "p1", name: "Organic Avocado", price: 388.7, quantity: 2, image: "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad" },
      { productId: "p2", name: "Fresh Strawberries", price: 453.7, quantity: 1, image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6" }
    ],
    status: "pending",
    deliveryAddress: {
      street: "123 Karen Road",
      city: "Nairobi",
      state: "Nairobi County",
      zipCode: "00200"
    },
    deliveryMethod: {
      id: "standard",
      name: "Standard Delivery",
      price: 250,
      estimatedDelivery: "2-3 business days"
    },
    paymentMethod: {
      id: "mpesa",
      name: "M-Pesa"
    },
    subtotal: 1231.1,
    deliveryFee: 250,
    total: 1481.1,
    createdAt: "2023-06-15T10:30:00Z",
    updatedAt: "2023-06-15T10:30:00Z",
    estimatedDelivery: "2023-06-18",
    tracking: {
      events: [
        {
          status: "pending",
          timestamp: "2023-06-15T10:30:00Z",
          description: "Order placed"
        }
      ]
    }
  },
  {
    id: "ord-002",
    userId: "user2",
    items: [
      { productId: "p3", name: "Organic Baby Spinach", price: 388.7, quantity: 1, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb" },
      { productId: "p4", name: "Free-Range Eggs", price: 648.7, quantity: 2, image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03" }
    ],
    status: "out_for_delivery",
    deliveryAddress: {
      street: "456 Westlands Avenue",
      city: "Nairobi",
      state: "Nairobi County",
      zipCode: "00100"
    },
    deliveryMethod: {
      id: "express",
      name: "Express Delivery",
      price: 450,
      estimatedDelivery: "Same day"
    },
    paymentMethod: {
      id: "card",
      name: "Credit Card"
    },
    subtotal: 1686.1,
    deliveryFee: 450,
    total: 2136.1,
    createdAt: "2023-06-14T14:20:00Z",
    updatedAt: "2023-06-15T09:15:00Z",
    estimatedDelivery: "2023-06-15",
    tracking: {
      events: [
        {
          status: "pending",
          timestamp: "2023-06-14T14:20:00Z",
          description: "Order placed"
        },
        {
          status: "processing",
          timestamp: "2023-06-15T08:00:00Z",
          description: "Order processing"
        },
        {
          status: "out_for_delivery",
          timestamp: "2023-06-15T09:15:00Z",
          description: "Out for delivery"
        }
      ],
      driver: {
        id: "drv-001",
        name: "John Kamau",
        phone: "254712345678",
        photo: "https://randomuser.me/api/portraits/men/1.jpg"
      }
    }
  },
  {
    id: "ord-003",
    userId: "user3",
    items: [
      { productId: "p5", name: "Whole Grain Bread", price: 492.7, quantity: 1, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff" },
      { productId: "p7", name: "Grass-Fed Ground Beef", price: 1168.7, quantity: 1, image: "https://images.unsplash.com/photo-1588347618760-79099292ef0f" }
    ],
    status: "delivered",
    deliveryAddress: {
      street: "789 Kilimani Street",
      city: "Nairobi",
      state: "Nairobi County",
      zipCode: "00300"
    },
    deliveryMethod: {
      id: "standard",
      name: "Standard Delivery",
      price: 250,
      estimatedDelivery: "2-3 business days"
    },
    paymentMethod: {
      id: "mpesa",
      name: "M-Pesa"
    },
    subtotal: 1661.4,
    deliveryFee: 250,
    total: 1911.4,
    createdAt: "2023-06-10T11:45:00Z",
    updatedAt: "2023-06-12T16:30:00Z",
    estimatedDelivery: "2023-06-12",
    tracking: {
      events: [
        {
          status: "pending",
          timestamp: "2023-06-10T11:45:00Z",
          description: "Order placed"
        },
        {
          status: "processing",
          timestamp: "2023-06-11T09:00:00Z",
          description: "Order processing"
        },
        {
          status: "dispatched",
          timestamp: "2023-06-12T10:15:00Z",
          description: "Order dispatched"
        },
        {
          status: "out_for_delivery",
          timestamp: "2023-06-12T14:00:00Z",
          description: "Out for delivery"
        },
        {
          status: "delivered",
          timestamp: "2023-06-12T16:30:00Z",
          description: "Order delivered"
        }
      ]
    }
  }
];

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "dispatched":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "out_for_delivery":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "delivered":
      return "bg-green-50 text-green-700 border-green-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const AdminOrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  
  // In a real application, this would fetch data from an API
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => {
      // This is using mock data, but would be a fetch call in a real app
      return Promise.resolve(sampleOrders);
    }
  });
  
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.street.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleViewOrder = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Orders Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="w-full sm:w-48">
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="out_for_delivery">Out for delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <div>
                        <div>{order.deliveryAddress.city}</div>
                        <div className="text-sm text-muted-foreground">{order.deliveryAddress.street}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell>KSh {order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeVariant(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredOrders?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOrdersTable;
