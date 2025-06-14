
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface ErrorStateProps {
  error: string;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <ShoppingBag size={30} className="text-muted-foreground" />
      </div>
      <h3 className="font-medium text-xl mb-2">Error loading orders</h3>
      <p className="text-muted-foreground mb-6">
        {error}
      </p>
      <Button onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );
};

export default ErrorState;
