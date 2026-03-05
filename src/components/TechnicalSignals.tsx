import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

const signals = [
  { name: "RSI (14)", value: 58.45, signal: "Neutral", strength: "medium" },
  { name: "MACD", value: "12.5 / 10.3", signal: "Bullish", strength: "strong" },
  { name: "Moving Avg (50)", value: 19756.30, signal: "Bullish", strength: "medium" },
  { name: "Moving Avg (200)", value: 19234.60, signal: "Bullish", strength: "strong" },
  { name: "Bollinger Bands", value: "Upper Band", signal: "Overbought", strength: "weak" },
  { name: "Stochastic", value: 72.5, signal: "Overbought", strength: "medium" },
  { name: "ADX", value: 28.4, signal: "Trending", strength: "medium" },
  { name: "Volume", value: "Above Avg", signal: "Bullish", strength: "strong" },
];

const getSignalColor = (signal: string) => {
  switch (signal) {
    case "Bullish": return "text-green-600 bg-green-100 dark:bg-green-900/20";
    case "Bearish": return "text-red-600 bg-red-100 dark:bg-red-900/20";
    case "Neutral": return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
    case "Overbought": return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
    case "Oversold": return "text-purple-600 bg-purple-100 dark:bg-purple-900/20";
    case "Trending": return "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20";
    default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
  }
};

export const TechnicalSignals = () => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Technical Signals</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {signals.map((signal) => (
          <div key={signal.name} className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">{signal.name}</div>
            <div className="font-bold mb-2">{signal.value}</div>
            <Badge className={getSignalColor(signal.signal)} variant="secondary">
              {signal.signal}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
