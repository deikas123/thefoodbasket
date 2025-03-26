
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Step {
  id: string;
  title: string;
  icon: LucideIcon;
}

interface CheckoutStepperProps {
  steps: Step[];
  currentStep: string;
}

const CheckoutStepper = ({ steps, currentStep }: CheckoutStepperProps) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <div className="flex flex-wrap justify-center">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentStepIndex;
        
        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div 
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                {
                  "border-primary bg-primary text-white": isActive || isCompleted,
                  "border-muted-foreground/30 text-muted-foreground": !isActive && !isCompleted
                }
              )}
            >
              <step.icon className="h-5 w-5" />
            </div>
            
            {/* Step title */}
            <div className="ml-2 mr-4">
              <span 
                className={cn("text-sm font-medium", {
                  "text-primary": isActive,
                  "text-muted-foreground": !isActive
                })}
              >
                {step.title}
              </span>
            </div>
            
            {/* Connector line - show for all but last step */}
            {index < steps.length - 1 && (
              <div 
                className={cn("hidden sm:block w-12 h-1 mx-2", {
                  "bg-primary": index < currentStepIndex,
                  "bg-muted": index >= currentStepIndex
                })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutStepper;
