
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Order, OrderStatus } from "@/types/order";
import { useNavigate } from "react-router-dom";

// Reuse the same sample orders from OrdersTable, but filter for only the ones that are being delivered
const sampleDeliveries = [
  {
    id: "ord-002",
    userId: "user2",
    items: [
      { productId: "p3", name: "Organic Baby Spinach", price: 388.7, quantity: 1, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb" },
      { productId: "p4", name: "Free-Range Eggs", price: 648.7, quantity: 2, image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03" }
    ],
    status: "out_for_delivery" as OrderStatus,
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
      id: "mpesa",
      name: "M-Pesa"
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
    id: "ord-004",
    userId: "user1",
    items: [
      { productId: "p1", name: "Organic Avocado", price: 388.7, quantity: 3, image: "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad" }
    ],
    status: "dispatched" as OrderStatus,
    deliveryAddress: {
      street: "789 Ngong Road",
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
      id: "card",
      name: "Credit Card"
    },
    subtotal: 1166.1,
    deliveryFee: 250,
    total: 1416.1,
    createdAt: "2023-06-15T10:00:00Z",
    updatedAt: "2023-06-15T11:30:00Z",
    estimatedDelivery: "2023-06-17",
    tracking: {
      events: [
        {
          status: "pending",
          timestamp: "2023-06-15T10:00:00Z",
          description: "Order placed"
        },
        {
          status: "processing",
          timestamp: "2023-06-15T10:45:00Z",
          description: "Order processing"
        },
        {
          status: "dispatched",
          timestamp: "2023-06-15T11:30:00Z",
          description: "Order dispatched"
        }
      ],
      driver: {
        id: "drv-002",
        name: "Mary Wanjiku",
        phone: "254723456789",
        photo: "https://randomuser.me/api/portraits/women/2.jpg"
      }
    }
  }
];

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case "dispatched":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "out_for_delivery":
      return "bg-purple-50 text-purple-700 border-purple-200";
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

const AdminDeliveriesTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  
  // In a real application, this would fetch data from an API
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["admin-deliveries"],
    queryFn: () => {
      // This is using mock data, but would be a fetch call in a real app
      return Promise.resolve(sampleDeliveries);
    }
  });
  
  const filteredDeliveries = deliveries?.filter(delivery => {
    const matchesSearch = 
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.deliveryAddress.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.deliveryAddress.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (delivery.tracking?.driver?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleViewDelivery = (deliveryId: string) => {
    navigate(`/admin/deliveries/${deliveryId}`);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Deliveries Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deliveries..."
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
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="out_for_delivery">Out for delivery</SelectItem>
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
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries?.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">{delivery.id}</TableCell>
                    <TableCell>{formatDate(delivery.estimatedDelivery)}</TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <div>{delivery.deliveryAddress.city}</div>
                          <div className="text-sm text-muted-foreground">{delivery.deliveryAddress.street}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {delivery.tracking?.driver && (
                          <>
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img 
                                src={delivery.tracking.driver.photo}
                                alt={delivery.tracking.driver.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{delivery.tracking.driver.name}</div>
                              <div className="text-sm text-muted-foreground">{delivery.tracking.driver.phone}</div>
                            </div>
                          </>
                        )}
                        {!delivery.tracking?.driver && (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeVariant(delivery.status)}>
                        {delivery.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewDelivery(delivery.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredDeliveries?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No deliveries found
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

export default AdminDeliveriesTable;
