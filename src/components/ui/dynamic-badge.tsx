
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const dynamicBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "text-foreground",
        discount: "border-transparent bg-red-500 text-white hover:bg-red-600",
        featured: "border-transparent bg-green-500 text-white hover:bg-green-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface DynamicBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dynamicBadgeVariants> {
  imageUrl?: string;
}

function DynamicBadge({ className, variant, imageUrl, children, ...props }: DynamicBadgeProps) {
  // Determine variant based on content if not explicitly set
  const getVariant = () => {
    if (variant && variant !== "default") return variant;
    
    const content = children?.toString().toLowerCase() || "";
    if (content.includes("off") || content.includes("%")) return "discount";
    if (content.includes("featured")) return "featured";
    
    return "default";
  };

  const finalVariant = getVariant();

  return (
    <div 
      className={cn(
        dynamicBadgeVariants({ variant: finalVariant }),
        "hover:scale-105 hover:shadow-md",
        className
      )} 
      {...props} 
    >
      {children}
    </div>
  )
}

export { DynamicBadge, dynamicBadgeVariants }
