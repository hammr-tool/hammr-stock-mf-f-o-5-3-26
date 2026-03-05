import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockShareholding as ShareholdingData } from "@/hooks/useStockDetails";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StockShareholdingProps {
  shareholding: ShareholdingData[];
}

export const StockShareholding = ({ shareholding }: StockShareholdingProps) => {
  if (!shareholding || shareholding.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shareholding Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No shareholding data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const latestQuarter = shareholding[0];

  const pieData = [
    { name: "Promoters", value: latestQuarter.promoter_holding || 0, color: "hsl(var(--primary))" },
    { name: "FII", value: latestQuarter.fii_holding || 0, color: "hsl(210, 100%, 50%)" },
    { name: "DII", value: latestQuarter.dii_holding || 0, color: "hsl(150, 70%, 45%)" },
    { name: "Government", value: latestQuarter.government_holding || 0, color: "hsl(45, 90%, 50%)" },
    { name: "Retail", value: latestQuarter.retail_holding || 0, color: "hsl(280, 70%, 50%)" },
    { name: "Others", value: latestQuarter.others_holding || 0, color: "hsl(0, 0%, 60%)" },
  ].filter((d) => d.value > 0);

  const trendData = shareholding
    .slice(0, 8)
    .reverse()
    .map((sh) => ({
      quarter: new Date(sh.quarter_end_date).toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      }),
      Promoters: sh.promoter_holding || 0,
      FII: sh.fii_holding || 0,
      DII: sh.dii_holding || 0,
    }));

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 w-full min-w-0">
      {/* Current Pattern */}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <CardTitle className="text-sm sm:text-base">
            Current Pattern ({formatDate(latestQuarter.quarter_end_date)})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="space-y-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs sm:text-sm">{item.name}</span>
                </div>
                <span className="font-medium text-xs sm:text-sm">{item.value.toFixed(2)}%</span>
              </div>
            ))}
          </div>

          <div className="mt-3 h-3 rounded-full overflow-hidden flex">
            {pieData.map((item) => (
              <div
                key={item.name}
                className="h-full transition-all"
                style={{
                  backgroundColor: item.color,
                  width: `${item.value}%`,
                }}
                title={`${item.name}: ${item.value.toFixed(2)}%`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <CardTitle className="text-sm sm:text-base">Quarterly Trend</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="quarter" fontSize={9} tick={{ fontSize: 9 }} />
                <YAxis fontSize={9} tick={{ fontSize: 9 }} domain={[0, 100]} width={35} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Bar dataKey="Promoters" stackId="a" fill="hsl(var(--primary))" />
                <Bar dataKey="FII" stackId="a" fill="hsl(210, 100%, 50%)" />
                <Bar dataKey="DII" stackId="a" fill="hsl(150, 70%, 45%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Historical Table */}
      <Card className="md:col-span-2 min-w-0 overflow-hidden">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <CardTitle className="text-sm sm:text-base">Historical Data</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap text-xs px-2">Quarter</TableHead>
                  <TableHead className="text-right whitespace-nowrap text-xs px-1.5">Promo</TableHead>
                  <TableHead className="text-right whitespace-nowrap text-xs px-1.5">FII</TableHead>
                  <TableHead className="text-right whitespace-nowrap text-xs px-1.5">DII</TableHead>
                  <TableHead className="text-right whitespace-nowrap text-xs px-1.5">Govt</TableHead>
                  <TableHead className="text-right whitespace-nowrap text-xs px-1.5">Retail</TableHead>
                  <TableHead className="text-right whitespace-nowrap text-xs px-1.5">Others</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shareholding.slice(0, 8).map((sh) => (
                  <TableRow key={sh.id}>
                    <TableCell className="font-medium whitespace-nowrap text-xs px-2">
                      {formatDate(sh.quarter_end_date)}
                    </TableCell>
                    <TableCell className="text-right text-xs px-1.5">
                      {sh.promoter_holding?.toFixed(1) || "—"}%
                    </TableCell>
                    <TableCell className="text-right text-xs px-1.5">
                      {sh.fii_holding?.toFixed(1) || "—"}%
                    </TableCell>
                    <TableCell className="text-right text-xs px-1.5">
                      {sh.dii_holding?.toFixed(1) || "—"}%
                    </TableCell>
                    <TableCell className="text-right text-xs px-1.5">
                      {sh.government_holding?.toFixed(1) || "—"}%
                    </TableCell>
                    <TableCell className="text-right text-xs px-1.5">
                      {sh.retail_holding?.toFixed(1) || "—"}%
                    </TableCell>
                    <TableCell className="text-right text-xs px-1.5">
                      {sh.others_holding?.toFixed(1) || "—"}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
