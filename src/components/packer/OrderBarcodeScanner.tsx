
import { useState, useEffect, useRef, memo } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, X, QrCode, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface OrderBarcodeScannerProps {
  expectedBarcode: string;
  onScanSuccess: () => void;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
  buttonClassName?: string;
  disabled?: boolean;
}

const OrderBarcodeScanner = memo(({
  expectedBarcode,
  onScanSuccess,
  buttonText = "Scan to Complete",
  buttonVariant = "default",
  buttonClassName = "",
  disabled = false
}: OrderBarcodeScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<"success" | "error" | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setScanResult(null);
      const codeReader = new BrowserMultiFormatReader();

      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        toast.error("No camera found on this device");
        setIsOpen(false);
        return;
      }

      const selectedDevice = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back')
      ) || videoInputDevices[0];

      const controls = await codeReader.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const scannedCode = result.getText();
            handleBarcodeScanned(scannedCode);
          }
          
          if (error && error.name !== 'NotFoundException') {
            console.error("Scanning error:", error);
          }
        }
      );

      controlsRef.current = controls;
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast.error("Failed to start camera. Please check permissions.");
      setIsOpen(false);
    }
  };

  const stopScanning = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setIsScanning(false);
  };

  const handleBarcodeScanned = (scannedCode: string) => {
    stopScanning();
    
    if (scannedCode === expectedBarcode) {
      setScanResult("success");
      toast.success("Barcode verified successfully!");
      
      setTimeout(() => {
        setIsOpen(false);
        onScanSuccess();
      }, 1000);
    } else {
      setScanResult("error");
      toast.error("Barcode does not match! Please scan the correct package.");
      
      // Allow retry after 2 seconds
      setTimeout(() => {
        setScanResult(null);
        if (videoRef.current) {
          startScanning();
        }
      }, 2000);
    }
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        className={buttonClassName}
        onClick={() => setIsOpen(true)}
        disabled={disabled}
      >
        <QrCode className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Scan Package Barcode
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-64 h-64 border-2 rounded-lg relative ${
                  scanResult === "success" ? "border-green-500" :
                  scanResult === "error" ? "border-red-500" :
                  "border-primary"
                }`}>
                  <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg ${
                    scanResult === "success" ? "border-green-500" :
                    scanResult === "error" ? "border-red-500" :
                    "border-primary"
                  }`}></div>
                  <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg ${
                    scanResult === "success" ? "border-green-500" :
                    scanResult === "error" ? "border-red-500" :
                    "border-primary"
                  }`}></div>
                  <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg ${
                    scanResult === "success" ? "border-green-500" :
                    scanResult === "error" ? "border-red-500" :
                    "border-primary"
                  }`}></div>
                  <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg ${
                    scanResult === "success" ? "border-green-500" :
                    scanResult === "error" ? "border-red-500" :
                    "border-primary"
                  }`}></div>
                  
                  {/* Result overlay */}
                  {scanResult === "success" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                      <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                  )}
                  {scanResult === "error" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                      <X className="h-16 w-16 text-red-500" />
                    </div>
                  )}
                  
                  {/* Scanning line animation */}
                  {!scanResult && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-primary animate-scan"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium mb-1">Expected: {expectedBarcode}</p>
              <p className="text-xs">Position the barcode within the frame</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes scan {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(256px);
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
});

OrderBarcodeScanner.displayName = "OrderBarcodeScanner";

export default OrderBarcodeScanner;
