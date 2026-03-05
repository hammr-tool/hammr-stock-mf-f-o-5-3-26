import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface IndicatorCardProps {
  name: string;
  value: string;
  signal: string;
  strength: number;
  description?: string;
}

const getSignalColor = (signal: string) => {
  switch (signal) {
    case "Bullish":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "Bearish":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "Neutral":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "Overbought":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    case "Oversold":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

const getStrengthDots = (strength: number) => {
  const dots = Math.ceil((strength / 100) * 5);
  return Array.from({ length: 5 }, (_, i) => (
    <div
      key={i}
      className={`h-1.5 w-1.5 rounded-full ${
        i < dots ? 'bg-primary' : 'bg-muted'
      }`}
    />
  ));
};

export const IndicatorCard = ({ name, value, signal, strength, description }: IndicatorCardProps) => {
  return (
    <Card className="p-2 md:p-3 hover:shadow-md transition-shadow">
      <div className="space-y-1 md:space-y-2">
        <div className="flex items-start justify-between">
          <div className="text-[10px] md:text-xs font-medium text-muted-foreground">{name}</div>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="text-xs md:text-lg font-bold">{value}</div>
        
        <div className="flex items-center justify-between">
          <Badge className={`${getSignalColor(signal)} text-[8px] md:text-xs px-1.5 md:px-2 py-0.5`} variant="secondary">
            {signal}
          </Badge>
          
          <div className="flex items-center gap-0.5">
            {getStrengthDots(strength)}
          </div>
        </div>
      </div>
    </Card>
  );
};
