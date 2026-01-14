
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getOrderFlowStats } from "@/services/orderFlowService";
import { Package, Truck, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";

const OrderFlowOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["order-flow-stats"],
    queryFn: getOrderFlowStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const flowSteps = [
    { 
      key: "pending", 
      label: "Pending", 
      icon: Clock, 
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
      textColor: "text-yellow-700 dark:text-yellow-400"
    },
    { 
      key: "processing", 
      label: "Packing", 
      icon: Package, 
      color: "bg-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      textColor: "text-blue-700 dark:text-blue-400"
    },
    { 
      key: "dispatched", 
      label: "Ready", 
      icon: CheckCircle, 
      color: "bg-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      textColor: "text-purple-700 dark:text-purple-400"
    },
    { 
      key: "out_for_delivery", 
      label: "Delivering", 
      icon: Truck, 
      color: "bg-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      textColor: "text-orange-700 dark:text-orange-400"
    },
    { 
      key: "delivered", 
      label: "Completed", 
      icon: CheckCircle, 
      color: "bg-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      textColor: "text-green-700 dark:text-green-400"
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Order Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-16 w-24 bg-muted rounded-lg animate-pulse" />
                {i < 4 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Order Flow Pipeline
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {stats?.total || 0} total orders
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Flow visualization */}
        <div className="flex items-center justify-between gap-1 md:gap-2 overflow-x-auto pb-2">
          {flowSteps.map((step, index) => {
            const Icon = step.icon;
            const count = stats?.[step.key as keyof typeof stats] || 0;
            
            return (
              <div key={step.key} className="flex items-center gap-1 md:gap-2">
                <div className={`${step.bgColor} rounded-lg p-2 md:p-3 min-w-[70px] md:min-w-[90px] text-center`}>
                  <div className="flex justify-center mb-1">
                    <div className={`${step.color} p-1.5 rounded-full`}>
                      <Icon className="h-3 w-3 md:h-4 md:w-4 text-white" />
                    </div>
                  </div>
                  <p className={`text-lg md:text-2xl font-bold ${step.textColor}`}>
                    {count}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                    {step.label}
                  </p>
                </div>
                {index < flowSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Cancelled orders */}
        {stats?.cancelled && stats.cancelled > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>{stats.cancelled} cancelled orders</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderFlowOverview;
