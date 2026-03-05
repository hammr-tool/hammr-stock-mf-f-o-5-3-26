import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { useOptionData } from "@/hooks/useOptionData";

export const OptionChain = () => {
  const { data, isLoading, error } = useOptionData();

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
  const atmStrike = Math.round(currentPrice / 50) * 50;

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Option Chain - NIFTY (Live) - Current: ₹{currentPrice.toFixed(2)}</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">CALLS OI</TableHead>
              <TableHead className="text-right">Volume</TableHead>
              <TableHead className="text-right">IV</TableHead>
              <TableHead className="text-right">LTP</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-center font-bold">Strike</TableHead>
              <TableHead className="text-left">Change</TableHead>
              <TableHead className="text-left">LTP</TableHead>
              <TableHead className="text-left">IV</TableHead>
              <TableHead className="text-left">Volume</TableHead>
              <TableHead className="text-left">PUTS OI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.map((opt) => (
              <TableRow key={opt.strike} className={opt.strike === atmStrike ? "bg-primary/5" : ""}>
                <TableCell className="text-right">{opt.call.oi.toLocaleString()}</TableCell>
                <TableCell className="text-right">{opt.call.volume.toLocaleString()}</TableCell>
                <TableCell className="text-right">{opt.call.iv.toFixed(2)}%</TableCell>
                <TableCell className="text-right font-medium">₹{opt.call.ltp.toFixed(2)}</TableCell>
                <TableCell className={`text-right flex items-center justify-end gap-1 ${opt.call.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {opt.call.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {opt.call.change.toFixed(2)}
                </TableCell>
                <TableCell className="text-center font-bold bg-muted">{opt.strike}</TableCell>
                <TableCell className={`text-left ${opt.put.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="flex items-center gap-1">
                    {opt.put.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {opt.put.change.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell className="text-left font-medium">₹{opt.put.ltp.toFixed(2)}</TableCell>
                <TableCell className="text-left">{opt.put.iv.toFixed(2)}%</TableCell>
                <TableCell className="text-left">{opt.put.volume.toLocaleString()}</TableCell>
                <TableCell className="text-left">{opt.put.oi.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
