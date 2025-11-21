import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mic, X, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/supabase";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import BarcodeScanner from "./BarcodeScanner";

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const EnhancedSearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { searchHistory, addSearchTerm, removeSearchTerm, clearSearchHistory } = useSearchHistory();

  // Debounce search term to reduce flickering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch product suggestions based on debounced search term
  const { data: suggestions = [] } = useQuery({
    queryKey: ["search-suggestions", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image")
        .ilike("name", `%${debouncedSearchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      return data as ProductType[];
    },
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
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
      addSearchTerm(finalTerm.trim());
      navigate(`/shop?search=${encodeURIComponent(finalTerm.trim())}`);
      setShowSuggestions(false);
      setShowHistory(false);
      setSearchTerm(finalTerm);
    }
  };

  const handleSuggestionClick = (productName: string) => {
    handleSearch(undefined, productName);
  };

  const handleHistoryClick = (term: string) => {
    setSearchTerm(term);
    handleSearch(undefined, term);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = showHistory ? searchHistory : suggestions;
    if ((!showSuggestions && !showHistory) || items.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        if (selectedIndex >= 0) {
          e.preventDefault();
          if (showHistory) {
            handleHistoryClick(searchHistory[selectedIndex]);
          } else {
            handleSuggestionClick(suggestions[selectedIndex].name);
          }
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setShowHistory(false);
        setSelectedIndex(-1);
        break;
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
            const value = e.target.value;
            setSearchTerm(value);
            setSelectedIndex(-1);
            
            // Only show/hide based on actual input length, not debounced
            if (value.length >= 2) {
              setShowHistory(false);
              // Don't show suggestions immediately - wait for debounce
            } else if (value.length === 0 && searchHistory.length > 0) {
              setShowSuggestions(false);
              setShowHistory(true);
            } else {
              setShowSuggestions(false);
              setShowHistory(false);
            }
          }}
          onFocus={() => {
            if (searchTerm.length >= 2) {
              setShowSuggestions(true);
            } else if (searchHistory.length > 0) {
              setShowHistory(true);
            }
          }}
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
          <BarcodeScanner />
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
      </form>

      {/* Search History Dropdown */}
      {showHistory && searchHistory.length > 0 && !searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden z-[100] animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <div className="py-2">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Recent Searches
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearchHistory}
                className="h-7 text-xs"
              >
                Clear All
              </Button>
            </div>
            {searchHistory.map((term, index) => (
              <div
                key={index}
                className={`flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors ${
                  index === selectedIndex ? "bg-muted" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleHistoryClick(term)}
                  className="flex-1 text-left flex items-center gap-3"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{term}</span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSearchTerm(term);
                  }}
                  className="h-7 w-7"
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Suggestions Dropdown - Only show when debounced term is ready */}
      {showSuggestions && debouncedSearchTerm.length >= 2 && suggestions.length > 0 && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden z-[100] animate-in fade-in-0 slide-in-from-top-1 duration-200">
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
