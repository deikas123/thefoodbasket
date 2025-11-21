import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Camera, Mic, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/supabase";

const EnhancedSearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch product suggestions based on search term
  const { data: suggestions = [] } = useQuery({
    queryKey: ["search-suggestions", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image")
        .ilike("name", `%${searchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      return data as ProductType[];
    },
    enabled: searchTerm.length >= 2
  });

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent, term?: string) => {
    e?.preventDefault();
    const finalTerm = term || searchTerm;
    if (finalTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(finalTerm.trim())}`);
      setShowSuggestions(false);
      setSearchTerm(finalTerm);
    }
  };

  const handleSuggestionClick = (productName: string) => {
    handleSearch(undefined, productName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex].name);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleImageSearch = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsProcessing(true);
    toast.info("Processing image...");

    try {
      // Simulate image processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulated search query extraction
      const mockSearchTerms = ["fresh vegetables", "organic fruits", "dairy products", "grains"];
      const randomTerm = mockSearchTerms[Math.floor(Math.random() * mockSearchTerms.length)];

      setSearchTerm(randomTerm);
      toast.success(`Found: ${randomTerm}`);
      navigate(`/shop?search=${encodeURIComponent(randomTerm)}`);
    } catch (error) {
      console.error("Image processing error:", error);
      toast.error("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice search is not supported in your browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Speak now");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      setIsListening(false);
      toast.success(`Searching for "${transcript}"`);
      handleSearch(undefined, transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      console.error("Speech recognition error:", event.error);
      
      if (event.error === "no-speech") {
        toast.error("No speech detected. Please try again.");
      } else if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please enable it in settings.");
      } else {
        toast.error("Voice search failed. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          type="text"
          placeholder="Search products, brands, categories..."
          className="pl-10 pr-24 h-10 rounded-full bg-muted/50 border-border focus:bg-background transition-colors"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(e.target.value.length >= 2);
            setSelectedIndex(-1);
          }}
          onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
        />

        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-16 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-muted"
            onClick={() => {
              setSearchTerm("");
              setShowSuggestions(false);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded-full transition-colors ${
              isListening ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "hover:bg-muted"
            }`}
            onClick={startVoiceSearch}
            disabled={isListening}
            title="Voice search"
          >
            <Mic className="h-3 w-3" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden z-50">
          <div className="py-2">
            {suggestions.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSuggestionClick(product.name)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors ${
                  index === selectedIndex ? "bg-muted" : ""
                }`}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">KSh {product.price.toFixed(2)}</p>
                </div>
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;
