
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useDynamicColor } from "@/hooks/useDynamicColor"

const dynamicBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "text-foreground",
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
  imageUrl: string;
}

function DynamicBadge({ className, variant, imageUrl, style, ...props }: DynamicBadgeProps) {
  const { backgroundColor, textColor, hoverColor, isLoading } = useDynamicColor(imageUrl);
  
  const dynamicStyle = variant === "default" && !isLoading ? {
    backgroundColor,
    color: textColor,
    ...style,
  } : style;

  return (
    <div 
      className={cn(
        dynamicBadgeVariants({ variant }), 
        variant === "default" && !isLoading && "hover:brightness-110",
        className
      )} 
      style={dynamicStyle}
      {...props} 
    />
  )
}

export { DynamicBadge, dynamicBadgeVariants }
