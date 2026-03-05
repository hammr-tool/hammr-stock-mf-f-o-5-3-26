import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { useOptionData } from "@/hooks/useOptionData";

interface OptionChainWithGreeksProps {
  symbol: string;
  strikeInterval: number;
  indexName: string;
}

export const OptionChainWithGreeks = ({ symbol, strikeInterval, indexName }: OptionChainWithGreeksProps) => {
  const { data, isLoading, error } = useOptionData(symbol, strikeInterval);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          Unable to load option chain data
        </div>
      </Card>
    );
  }

  const { optionData: options, currentPrice } = data;
  const atmStrike = Math.round(currentPrice / strikeInterval) * strikeInterval;

  return (
    <Card className="p-2 md:p-4">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h2 className="text-sm md:text-xl font-bold">Option Chain with Greeks - {indexName} (Live) - Current: ₹{currentPrice.toFixed(2)}</h2>
        <div className="flex gap-1 md:gap-2">
          <Button size="sm" variant="outline" onClick={handleZoomOut} className="h-7 w-7 md:h-9 md:w-9 p-0">
            <ZoomOut className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleZoomIn} className="h-7 w-7 md:h-9 md:w-9 p-0">
            <ZoomIn className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto touch-pan-x touch-pan-y">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%` }}>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-md">
              <TableRow className="bg-card border-b hover:bg-card">
                <TableHead className="text-right bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">CALLS OI</TableHead>
                <TableHead className="text-right bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">Vol</TableHead>
                <TableHead className="text-right bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">IV</TableHead>
                <TableHead className="text-right bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">LTP</TableHead>
                <TableHead className="text-right bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">Chg</TableHead>
                <TableHead className="text-right bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">Δ</TableHead>
                <TableHead className="text-right bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">Γ</TableHead>
                <TableHead className="text-right bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">Θ</TableHead>
                <TableHead className="text-right bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">ν</TableHead>
                <TableHead className="text-center font-bold bg-card sticky top-0 text-[10px] md:text-sm p-1 md:p-2">Strike</TableHead>
                <TableHead className="text-left bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">Δ</TableHead>
                <TableHead className="text-left bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">Γ</TableHead>
                <TableHead className="text-left bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">Θ</TableHead>
                <TableHead className="text-left bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">ν</TableHead>
                <TableHead className="text-left bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">Chg</TableHead>
                <TableHead className="text-left bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">LTP</TableHead>
                <TableHead className="text-left bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">IV</TableHead>
                <TableHead className="text-left bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">Vol</TableHead>
                <TableHead className="text-left bg-card sticky top-0 text-[9px] md:text-sm p-1 md:p-2">PUTS OI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {options.map((opt) => (
                <TableRow key={opt.strike} className={opt.strike === atmStrike ? "bg-primary/5" : ""}>
                  <TableCell className="text-right text-[8px] md:text-sm p-1 md:p-2">{opt.call.oi.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-[8px] md:text-sm p-1 md:p-2">{opt.call.volume.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-[8px] md:text-sm p-1 md:p-2">{opt.call.iv.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium text-[8px] md:text-sm p-1 md:p-2">₹{opt.call.ltp.toFixed(2)}</TableCell>
                  <TableCell className={`text-right text-[8px] md:text-sm p-1 md:p-2 ${opt.call.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {opt.call.change >= 0 ? '+' : ''}{opt.call.change.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-[8px] md:text-xs p-1 md:p-2">{opt.call.delta?.toFixed(3) || '-'}</TableCell>
                  <TableCell className="text-right text-[8px] md:text-xs p-1 md:p-2">{opt.call.gamma?.toFixed(4) || '-'}</TableCell>
                  <TableCell className="text-right text-[8px] md:text-xs text-destructive p-1 md:p-2">{opt.call.theta?.toFixed(2) || '-'}</TableCell>
                  <TableCell className="text-right text-[8px] md:text-xs p-1 md:p-2">{opt.call.vega?.toFixed(3) || '-'}</TableCell>
                  <TableCell className="text-center font-bold bg-muted text-[9px] md:text-sm p-1 md:p-2">{opt.strike}</TableCell>
                  <TableCell className="text-left text-[8px] md:text-xs p-1 md:p-2">{opt.put.delta?.toFixed(3) || '-'}</TableCell>
                  <TableCell className="text-left text-[8px] md:text-xs p-1 md:p-2">{opt.put.gamma?.toFixed(4) || '-'}</TableCell>
                  <TableCell className="text-left text-[8px] md:text-xs text-destructive p-1 md:p-2">{opt.put.theta?.toFixed(2) || '-'}</TableCell>
                  <TableCell className="text-left text-[8px] md:text-xs p-1 md:p-2">{opt.put.vega?.toFixed(3) || '-'}</TableCell>
                  <TableCell className={`text-left text-[8px] md:text-sm p-1 md:p-2 ${opt.put.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {opt.put.change >= 0 ? '+' : ''}{opt.put.change.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-left font-medium text-[8px] md:text-sm p-1 md:p-2">₹{opt.put.ltp.toFixed(2)}</TableCell>
                  <TableCell className="text-left text-[8px] md:text-sm p-1 md:p-2">{opt.put.iv.toFixed(2)}</TableCell>
                  <TableCell className="text-left text-[8px] md:text-sm p-1 md:p-2">{opt.put.volume.toLocaleString()}</TableCell>
                  <TableCell className="text-left text-[8px] md:text-sm p-1 md:p-2">{opt.put.oi.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};
