
import { UserRole } from "@/types/supabase";

export const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "customer":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "delivery":
      return "bg-green-50 text-green-700 border-green-200";
    case "customer_service":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "order_fulfillment":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "accountant":
      return "bg-pink-50 text-pink-700 border-pink-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export const formatRoleName = (role: UserRole) => {
  switch (role) {
    case 'customer_service': return 'Customer Service';
    case 'order_fulfillment': return 'Order Fulfillment';
    case 'delivery': return 'Delivery';
    case 'accountant': return 'Accountant';
    case 'admin': return 'Admin';
    case 'customer': return 'Customer';
    default: return role;
  }
};

export const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
