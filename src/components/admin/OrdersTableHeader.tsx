
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface OrdersTableHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const OrdersTableHeader = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}: OrdersTableHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="w-full sm:w-48">
        <Select 
          value={statusFilter} 
          onValueChange={onStatusFilterChange}
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
  );
};

export default OrdersTableHeader;
