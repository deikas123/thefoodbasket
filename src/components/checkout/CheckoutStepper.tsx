
import { cn } from "@/lib/utils";
import { LucideIcon, Check } from "lucide-react";

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
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentStepIndex;
        
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              {/* Step circle */}
              <div 
                className={cn(
                  "w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  {
                    "border-primary bg-primary text-primary-foreground shadow-md": isActive,
                    "border-primary bg-primary text-primary-foreground": isCompleted,
                    "border-muted-foreground/30 text-muted-foreground": !isActive && !isCompleted
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              
              {/* Step title */}
              <span 
                className={cn("text-[10px] md:text-xs font-medium mt-1.5", {
                  "text-primary": isActive,
                  "text-foreground": isCompleted,
                  "text-muted-foreground": !isActive && !isCompleted
                })}
              >
                {step.title}
              </span>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className={cn("flex-1 h-0.5 mx-2 mt-[-1rem] rounded-full transition-colors", {
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
