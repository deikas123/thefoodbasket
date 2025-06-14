
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getUserRedemptions } from "@/services/loyaltyService";
import { formatCurrency } from "@/utils/currencyFormatter";
import { formatDate } from "@/utils/userUtils";

const LoyaltyRedemptionsTable = () => {
  const { data: redemptions = [], isLoading } = useQuery({
    queryKey: ['loyalty-redemptions'],
    queryFn: getUserRedemptions,
  });
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loyalty Points Redemptions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading redemptions...</div>
        ) : redemptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No redemptions found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Points Redeemed</TableHead>
                  <TableHead>KSH Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptions.map((redemption) => (
                  <TableRow key={redemption.id}>
                    <TableCell>{formatDate(redemption.created_at)}</TableCell>
                    <TableCell>{redemption.points_redeemed}</TableCell>
                    <TableCell>{formatCurrency(redemption.ksh_value)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(redemption.status)}>
                        {redemption.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{redemption.order_id || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoyaltyRedemptionsTable;
