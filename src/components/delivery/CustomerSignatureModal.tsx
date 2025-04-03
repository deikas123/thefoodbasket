
import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { Clipboard, CheckCircle, RotateCcw } from "lucide-react";

interface CustomerSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onComplete: (order: Order, signatureData: string) => Promise<void>;
}

const CustomerSignatureModal: React.FC<CustomerSignatureModalProps> = ({ 
  isOpen, 
  onClose, 
  order,
  onComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    setHasSigned(true);
    
    // Get canvas position
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate position relative to canvas
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get canvas position
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      
      // Prevent scrolling when drawing
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate position relative to canvas
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const endDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };
  
  const handleComplete = async () => {
    if (!hasSigned) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert the canvas to a data URL
      const signatureData = canvas.toDataURL('image/png');
      
      // Submit the signature
      await onComplete(order, signatureData);
      
      // Reset state
      clearCanvas();
      
    } catch (error) {
      console.error('Error submitting signature:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set canvas size on component mount and when dialog opens
  React.useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      // Set canvas dimensions based on its parent container size
      canvas.width = canvas.offsetWidth;
      canvas.height = 200; // Fixed height for signatures
      
      // Initialize canvas with a white background
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Clipboard className="h-5 w-5 mr-2" />
            Customer Signature for Order {order.id}
          </DialogTitle>
          <DialogDescription>
            Please ask the customer to sign below to confirm delivery
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted p-4 rounded-md mb-4">
            <h3 className="text-sm font-medium mb-2">Delivery Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span> {order.customer?.name || 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">Order ID:</span> {order.id}
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Address:</span> {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Customer Signature</label>
            <div className="border rounded-md relative">
              <canvas 
                ref={canvasRef}
                className="w-full touch-none bg-white rounded-md border"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
                style={{ height: '200px' }}
              />
              {!hasSigned && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground">
                  Sign here
                </div>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleComplete} 
            disabled={!hasSigned || isSubmitting}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            {isSubmitting ? 'Completing...' : 'Complete Delivery'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerSignatureModal;
