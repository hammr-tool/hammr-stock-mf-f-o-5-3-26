import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Color palette for fallback avatars based on symbol
const colors = [
  "bg-blue-500/15 text-blue-600",
  "bg-emerald-500/15 text-emerald-600",
  "bg-violet-500/15 text-violet-600",
  "bg-amber-500/15 text-amber-600",
  "bg-rose-500/15 text-rose-600",
  "bg-cyan-500/15 text-cyan-600",
  "bg-orange-500/15 text-orange-600",
  "bg-teal-500/15 text-teal-600",
  "bg-indigo-500/15 text-indigo-600",
  "bg-pink-500/15 text-pink-600",
];

function getColorForSymbol(symbol: string) {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Generate multiple logo URL candidates for Indian stocks
function getLogoUrls(symbol: string): string[] {
  const sym = symbol.toUpperCase();
  const symLower = symbol.toLowerCase();
  return [
    // Groww CDN - most reliable for Indian stocks
    `https://groww.in/media/logos/stocks/nse_${symLower}.svg`,
    // TradingView logos
    `https://s3-symbol-logo.tradingview.com/${symLower}--big.svg`,
    // Alternative patterns
    `https://assets.tickertape.in/stock-logos/${sym}.png`,
  ];
}

interface StockLogoProps {
  symbol: string;
  companyName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StockLogo = ({ symbol, companyName, size = "sm", className }: StockLogoProps) => {
  const [urlIndex, setUrlIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  const sizeClasses = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  };

  const urls = getLogoUrls(symbol);
  const initials = symbol.slice(0, 2);
  const colorClass = getColorForSymbol(symbol);

  const handleImageError = () => {
    if (urlIndex < urls.length - 1) {
      setUrlIndex((prev) => prev + 1);
    } else {
      setAllFailed(true);
    }
  };

  return (
    <Avatar className={cn(sizeClasses[size], "shrink-0", className)}>
      {!allFailed && (
        <AvatarImage
          src={urls[urlIndex]}
          alt={companyName || symbol}
          onError={handleImageError}
        />
      )}
      <AvatarFallback className={cn("font-semibold", sizeClasses[size], colorClass)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
