import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface BarcodeScannerProps {
  onScanComplete?: (barcode: string) => void;
}

const BarcodeScanner = ({ onScanComplete }: BarcodeScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const navigate = useNavigate();


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
      const codeReader = new BrowserMultiFormatReader();

      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        toast.error("No camera found on this device");
        setIsOpen(false);
        return;
      }

      // Use the back camera if available (for mobile devices)
      const selectedDevice = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back')
      ) || videoInputDevices[0];

      const controls = await codeReader.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const barcode = result.getText();
            toast.success(`Barcode detected: ${barcode}`);
            handleBarcodeScanned(barcode);
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

  const handleBarcodeScanned = (barcode: string) => {
    stopScanning();
    setIsOpen(false);
    
    if (onScanComplete) {
      onScanComplete(barcode);
    } else {
      // Default behavior: search for the barcode
      navigate(`/shop?search=${encodeURIComponent(barcode)}`);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full hover:bg-muted"
        onClick={() => setIsOpen(true)}
        title="Scan barcode"
      >
        <Camera className="h-3 w-3" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Scan Product Barcode
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
                <div className="w-64 h-64 border-2 border-primary rounded-lg relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                  
                  {/* Scanning line animation */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary animate-scan"></div>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Position the barcode within the frame</p>
              <p className="text-xs mt-1">Scanning will happen automatically</p>
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
};

export default BarcodeScanner;
