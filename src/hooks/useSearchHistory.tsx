import { useState, useEffect } from "react";

const SEARCH_HISTORY_KEY = "searchHistory";
const MAX_HISTORY_ITEMS = 10;

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading search history:", error);
    }
  };

  const addSearchTerm = (term: string) => {
    if (!term.trim()) return;

    const normalizedTerm = term.trim().toLowerCase();
    
    // Remove duplicate if exists and add to front
    const updatedHistory = [
      term.trim(),
      ...searchHistory.filter(item => item.toLowerCase() !== normalizedTerm)
    ].slice(0, MAX_HISTORY_ITEMS);

    setSearchHistory(updatedHistory);
    
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  };

  const removeSearchTerm = (term: string) => {
    const updatedHistory = searchHistory.filter(item => item !== term);
    setSearchHistory(updatedHistory);
    
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error updating search history:", error);
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  };

  return {
    searchHistory,
    addSearchTerm,
    removeSearchTerm,
    clearSearchHistory
  };
};
