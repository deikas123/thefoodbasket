
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Camera, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

const EnhancedSearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleImageSearch = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    setIsProcessing(true);
    
    try {
      // For now, we'll simulate image processing
      // In a real implementation, you'd send this to an AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate extracted text from image
      const simulatedResults = ["apple", "organic fruit", "red apple"];
      const searchQuery = simulatedResults[0];
      
      setSearchTerm(searchQuery);
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      toast.success("Image processed successfully!");
      
    } catch (error) {
      toast.error("Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice search is not supported in your browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Speak now");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      navigate(`/shop?search=${encodeURIComponent(transcript)}`);
      toast.success("Voice search completed!");
    };

    recognition.onerror = (event) => {
      toast.error("Voice search failed: " + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="relative mr-1">
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8 pr-20 h-9 md:w-[180px] lg:w-[300px] rounded-full bg-muted focus:bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-1 top-1 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleImageSearch}
              disabled={isProcessing}
            >
              <Camera className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 ${isListening ? 'text-red-500' : ''}`}
              onClick={startVoiceSearch}
              disabled={isListening}
            >
              {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </form>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {isProcessing && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-background border rounded-md shadow-md">
          <div className="flex items-center gap-2 text-sm">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            Processing image...
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;
