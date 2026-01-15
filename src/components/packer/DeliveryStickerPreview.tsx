
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Printer, MapPin, Phone, User, Package } from "lucide-react";
import { generateBarcodeSVG, svgToDataUrl, printDeliverySticker } from "@/utils/barcodeGenerator";

interface DeliveryStickerPreviewProps {
  barcode: string;
  customerName: string;
  customerPhone: string;
  address: {
    street: string;
    city: string;
    postalCode?: string;
    location?: { lat: number; lng: number };
  };
  orderId: string;
  deliveryMethod: string;
  orderDate: string;
  onPrint?: () => void;
}

const DeliveryStickerPreview = memo(({
  barcode,
  customerName,
  customerPhone,
  address,
  orderId,
  deliveryMethod,
  orderDate,
  onPrint
}: DeliveryStickerPreviewProps) => {
  const barcodeSvg = generateBarcodeSVG(barcode, 200, 50);
  const isExpress = deliveryMethod.toLowerCase().includes('express');

  const handlePrint = () => {
    printDeliverySticker(
      barcode,
      customerName,
      customerPhone,
      address,
      orderId,
      deliveryMethod,
      orderDate
    );
    onPrint?.();
  };

  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Delivery Sticker
          </CardTitle>
          <Badge variant={isExpress ? "destructive" : "secondary"}>
            {deliveryMethod}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Barcode */}
        <div className="flex justify-center p-3 bg-white rounded-lg border">
          <img 
            src={svgToDataUrl(barcodeSvg)} 
            alt={`Barcode: ${barcode}`}
            className="max-w-full"
          />
        </div>

        {/* Customer Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{customerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{customerPhone}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p>{address.street}</p>
              <p className="text-muted-foreground">
                {address.city}{address.postalCode ? `, ${address.postalCode}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Order ID */}
        <div className="text-xs text-center text-muted-foreground font-mono">
          Order: #{orderId.slice(0, 8)} | {new Date(orderDate).toLocaleDateString()}
        </div>

        {/* Print Button */}
        <Button 
          onClick={handlePrint}
          className="w-full"
          variant="outline"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Sticker
        </Button>
      </CardContent>
    </Card>
  );
});

DeliveryStickerPreview.displayName = "DeliveryStickerPreview";

export default DeliveryStickerPreview;
