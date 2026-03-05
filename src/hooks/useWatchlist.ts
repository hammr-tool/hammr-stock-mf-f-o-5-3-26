import { useState, useEffect, useCallback } from "react";

const WATCHLIST_KEY = "hammr_stock_watchlist";

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => (prev.includes(symbol) ? prev : [...prev, symbol]));
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
  }, []);

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  }, []);

  const isInWatchlist = useCallback(
    (symbol: string) => watchlist.includes(symbol),
    [watchlist]
  );

  return { watchlist, addToWatchlist, removeFromWatchlist, toggleWatchlist, isInWatchlist };
};
