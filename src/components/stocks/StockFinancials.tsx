import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockFinancial } from "@/hooks/useStockDetails";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StockFinancialsProps {
  financials: StockFinancial[];
}

export const StockFinancials = ({ financials }: StockFinancialsProps) => {
  const [periodType, setPeriodType] = useState<"quarterly" | "annual">("quarterly");

  const filteredData = financials
    .filter((f) => f.period_type === periodType)
    .slice(0, periodType === "quarterly" ? 8 : 5);

  const formatValue = (value?: number) => {
    if (!value) return "—";
    if (Math.abs(value) >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K Cr`;
    }
    return `₹${value.toFixed(0)} Cr`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });
  };

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Financial Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No financial data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Profit & Loss</CardTitle>
          <Tabs value={periodType} onValueChange={(v) => setPeriodType(v as typeof periodType)}>
            <TabsList className="h-8">
              <TabsTrigger value="quarterly" className="text-xs h-7">
                Quarterly
              </TabsTrigger>
              <TabsTrigger value="annual" className="text-xs h-7">
                Annual
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Period</TableHead>
                <TableHead className="text-right whitespace-nowrap">Revenue</TableHead>
                <TableHead className="text-right whitespace-nowrap">Op. Profit</TableHead>
                <TableHead className="text-right whitespace-nowrap">Net Profit</TableHead>
                <TableHead className="text-right whitespace-nowrap">EBITDA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((fin) => (
                <TableRow key={fin.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {formatDate(fin.period_end_date)}
                  </TableCell>
                  <TableCell className="text-right">{formatValue(fin.revenue)}</TableCell>
                  <TableCell className="text-right">{formatValue(fin.operating_profit)}</TableCell>
                  <TableCell className="text-right">{formatValue(fin.net_profit)}</TableCell>
                  <TableCell className="text-right">{formatValue(fin.ebitda)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
