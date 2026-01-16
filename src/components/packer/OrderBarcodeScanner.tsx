
import { useState, useEffect, useRef, memo, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, X, QrCode, CheckCircle, Keyboard, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [manualInput, setManualInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("camera");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (e) {
        console.log("Error stopping scanner:", e);
      }
      controlsRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const verifyBarcode = useCallback((scannedCode: string) => {
    stopScanning();
    
    // Normalize both codes for comparison (trim, uppercase)
    const normalizedScanned = scannedCode.trim().toUpperCase();
    const normalizedExpected = expectedBarcode.trim().toUpperCase();
    
    if (normalizedScanned === normalizedExpected) {
      setScanResult("success");
      toast.success("Barcode verified successfully!");
      
      setTimeout(() => {
        setIsOpen(false);
        setScanResult(null);
        setManualInput("");
        onScanSuccess();
      }, 1000);
    } else {
      setScanResult("error");
      toast.error(`Barcode mismatch! Expected: ${expectedBarcode}`);
      
      setTimeout(() => {
        setScanResult(null);
        // Restart scanning after error
        if (activeTab === "camera") {
          startScanning();
        }
      }, 2000);
    }
  }, [expectedBarcode, onScanSuccess, stopScanning, activeTab]);

  const startScanning = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      setCameraError(null);
      setIsScanning(true);
      setScanResult(null);
      
      // Configure hints for better barcode detection
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.ITF
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      
      const codeReader = new BrowserMultiFormatReader(hints, {
        delayBetweenScanAttempts: 500,
        delayBetweenScanSuccess: 1000,
      });
      
      // Get available video devices
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        setCameraError("No camera found on this device");
        setActiveTab("manual");
        return;
      }

      // Prefer back camera
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;

      // Start decoding from video device
      const controls = await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            console.log("Scanned barcode:", scannedText);
            verifyBarcode(scannedText);
          }
          // NotFoundException is expected when no barcode is in view
          if (error && error.name !== 'NotFoundException') {
            console.error("Scanning error:", error);
          }
        }
      );
      
      controlsRef.current = controls;
      
    } catch (error: any) {
      console.error("Error starting scanner:", error);
      setCameraError(error.message || "Failed to access camera. Please check permissions.");
      setActiveTab("manual");
      setIsScanning(false);
    }
  }, [verifyBarcode]);

  useEffect(() => {
    if (isOpen && activeTab === "camera") {
      const timer = setTimeout(() => {
        startScanning();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopScanning();
      };
    } else {
      stopScanning();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      verifyBarcode(manualInput);
    }
  };

  const handleClose = () => {
    stopScanning();
    setIsOpen(false);
    setScanResult(null);
    setManualInput("");
    setCameraError(null);
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

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Scan Package Barcode
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera" className="gap-2">
                <Camera className="h-4 w-4" />
                Camera
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <Keyboard className="h-4 w-4" />
                Manual
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="camera" className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                    <Camera className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm mb-4">{cameraError}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCameraError(null);
                        startScanning();
                      }}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className={`w-4/5 h-24 border-2 rounded-lg relative ${
                        scanResult === "success" ? "border-green-500" :
                        scanResult === "error" ? "border-red-500" :
                        "border-primary"
                      }`}>
                        {/* Corner markers */}
                        <div className={`absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg ${
                          scanResult === "success" ? "border-green-500" :
                          scanResult === "error" ? "border-red-500" :
                          "border-primary"
                        }`} />
                        <div className={`absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg ${
                          scanResult === "success" ? "border-green-500" :
                          scanResult === "error" ? "border-red-500" :
                          "border-primary"
                        }`} />
                        <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg ${
                          scanResult === "success" ? "border-green-500" :
                          scanResult === "error" ? "border-red-500" :
                          "border-primary"
                        }`} />
                        <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 rounded-br-lg ${
                          scanResult === "success" ? "border-green-500" :
                          scanResult === "error" ? "border-red-500" :
                          "border-primary"
                        }`} />
                        
                        {/* Result overlay */}
                        {scanResult === "success" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                          </div>
                        )}
                        {scanResult === "error" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded">
                            <X className="h-10 w-10 text-red-500" />
                          </div>
                        )}
                        
                        {/* Scanning line animation */}
                        {!scanResult && isScanning && (
                          <div className="absolute inset-x-0 top-0 h-0.5 bg-primary animate-scan" />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <p className="text-center text-xs text-muted-foreground">
                Point camera at the barcode on the package
              </p>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-3">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Keyboard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Enter the barcode manually or use a USB scanner
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter barcode..."
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                    className="font-mono uppercase"
                    autoFocus
                  />
                  <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
                    Verify
                  </Button>
                </div>
                
                {scanResult === "success" && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span>Barcode verified!</span>
                  </div>
                )}
                
                {scanResult === "error" && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-400">
                    <X className="h-5 w-5" />
                    <span>Barcode mismatch!</span>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm border-t pt-3">
            <p className="font-medium text-muted-foreground">Expected:</p>
            <p className="font-mono text-lg">{expectedBarcode}</p>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes scan {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(92px);
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
