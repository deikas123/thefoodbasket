
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock } from "lucide-react";

interface PayLaterOptionProps {
  title: string;
  description: string;
  features: string[];
  isEnabled: boolean;
}

const PayLaterOption = ({ title, description, features, isEnabled }: PayLaterOptionProps) => {
  return (
    <Card className={`${isEnabled ? 'border-green-500 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isEnabled ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5 text-gray-400" />
            )}
            {title}
          </CardTitle>
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Available" : "Requires Verification"}
          </Badge>
        </div>
        <CardDescription className={isEnabled ? "text-gray-700" : "text-gray-500"}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className={`h-4 w-4 ${isEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={isEnabled ? "text-gray-700" : "text-gray-500"}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PayLaterOption;
