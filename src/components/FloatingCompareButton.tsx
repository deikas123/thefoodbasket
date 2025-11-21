import { useState } from "react";
import { useComparison } from "@/context/ComparisonContext";
import { Button } from "@/components/ui/button";
import { GitCompare } from "lucide-react";
import { ProductComparison } from "@/components/product/ProductComparison";

export const FloatingCompareButton = () => {
  const { comparisonItems } = useComparison();
  const [isOpen, setIsOpen] = useState(false);

  if (comparisonItems.length === 0) return null;

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-24 right-6 z-40 h-14 rounded-full shadow-2xl gap-2 px-6"
        onClick={() => setIsOpen(true)}
      >
        <GitCompare className="h-5 w-5" />
        Compare ({comparisonItems.length})
      </Button>

      <ProductComparison isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
