import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface OverallSuggestionProps {
  recommendation: string;
  confidence: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
}

const getRecommendationColor = (recommendation: string) => {
  switch (recommendation) {
    case "Strong Bullish":
      return "bg-success text-success-foreground shadow-lg";
    case "Bullish":
      return "bg-success/80 text-success-foreground shadow-md";
    case "Neutral":
      return "bg-secondary text-secondary-foreground shadow-md";
    case "Bearish":
      return "bg-destructive/80 text-destructive-foreground shadow-md";
    case "Strong Bearish":
      return "bg-destructive text-destructive-foreground shadow-lg";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getRecommendationIcon = (recommendation: string) => {
  if (recommendation.includes("Bullish")) return TrendingUp;
  if (recommendation.includes("Bearish")) return TrendingDown;
  return Minus;
};

export const OverallSuggestion = ({
  recommendation,
  confidence,
  bullishCount,
  bearishCount,
  neutralCount
}: OverallSuggestionProps) => {
  const Icon = getRecommendationIcon(recommendation);
  const total = bullishCount + bearishCount + neutralCount;

  return (
    <Card className="p-2.5 bg-gradient-to-br from-card to-muted/20">
      <div className="space-y-2.5">
        <div className="text-center space-y-1">
          <h3 className="text-[11px] font-semibold text-muted-foreground">Overall Indication</h3>
          
          <div className="flex items-center justify-center gap-1.5">
            <Badge className={`${getRecommendationColor(recommendation)} text-xs px-2.5 py-1`}>
              <Icon className="h-3.5 w-3.5 mr-1" />
              {recommendation}
            </Badge>
          </div>

          <div className="text-xl font-bold text-primary">
            {confidence}% Confidence
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-muted-foreground">Indicator Breakdown</span>
            <span className="font-medium">{total} Total Indicators</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success shadow-sm"></div>
                <span className="text-[9px] font-medium">Bullish</span>
              </div>
              <span className="font-semibold text-success text-[10px]">{bullishCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-sm"></div>
                <span className="text-[9px] font-medium">Neutral</span>
              </div>
              <span className="font-semibold text-secondary text-[10px]">{neutralCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive shadow-sm"></div>
                <span className="text-[9px] font-medium">Bearish</span>
              </div>
              <span className="font-semibold text-destructive text-[10px]">{bearishCount}</span>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden flex shadow-inner">
            <div 
              className="bg-success h-full transition-all duration-500" 
              style={{ width: `${(bullishCount / total) * 100}%` }}
            ></div>
            <div 
              className="bg-secondary h-full transition-all duration-500" 
              style={{ width: `${(neutralCount / total) * 100}%` }}
            ></div>
            <div 
              className="bg-destructive h-full transition-all duration-500" 
              style={{ width: `${(bearishCount / total) * 100}%` }}
            ></div>
          </div>
        </div>

        <p className="text-[9px] text-center text-muted-foreground">
          Based on {total} technical indicators analyzing momentum, trend, moving averages, and volatility.
        </p>
      </div>
    </Card>
  );
};
