
import React from "react";
import { Edit, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryOption } from "@/services/deliveryOptionsService";

interface DeliveryOptionsListProps {
  options: DeliveryOption[] | undefined;
  isLoading: boolean;
  onEdit: (option: DeliveryOption) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const DeliveryOptionsList = ({ options, isLoading, onEdit, onDelete, isDeleting }: DeliveryOptionsListProps) => {
  if (isLoading) {
    return <div className="text-center py-10">Loading delivery options...</div>;
  }

  if (options?.length === 0) {
    return (
      <div className="text-center py-10">
        <Truck className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No delivery options</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new delivery option.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {options?.map((option) => (
        <Card key={option.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{option.name}</CardTitle>
              <div className="flex items-center space-x-2">
                {option.is_express && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Express
                  </span>
                )}
                {option.active ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            {option.description && (
              <CardDescription>{option.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Price:</span>
                <span>${option.base_price}</span>
              </div>
              {option.price_per_km && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per KM:</span>
                  <span>${option.price_per_km}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Time:</span>
                <span>{option.estimated_delivery_days} days</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(option)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(option.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default DeliveryOptionsList;
