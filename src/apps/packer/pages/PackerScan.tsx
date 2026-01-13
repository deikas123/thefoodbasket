
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ScanLine, CheckCircle, Package } from "lucide-react";

const PackerScan = () => {
  const [barcode, setBarcode] = useState("");
  const [scannedItems, setScannedItems] = useState<string[]>([]);

  const handleScan = () => {
    if (barcode && !scannedItems.includes(barcode)) {
      setScannedItems([...scannedItems, barcode]);
      toast.success(`Scanned: ${barcode}`);
      setBarcode("");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scan & Pack</h1>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ScanLine className="h-5 w-5" />Barcode Scanner</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Enter or scan barcode..." value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleScan()} />
            <Button onClick={handleScan}><ScanLine className="h-4 w-4 mr-1" />Scan</Button>
          </div>
          {scannedItems.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Scanned Items ({scannedItems.length})</p>
              {scannedItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded"><CheckCircle className="h-4 w-4 text-green-600" /><span>{item}</span></div>
              ))}
              <Button variant="outline" onClick={() => { setScannedItems([]); toast.success("Quality check complete!"); }}>Complete Quality Check</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PackerScan;
