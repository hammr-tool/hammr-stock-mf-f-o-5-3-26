import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IVDataPoint } from "@/hooks/useLiveChartData";

interface IVChartProps {
  data: IVDataPoint[];
  atmStrike: number;
  currentPrice: number;
}

export const IVChart = ({ data, atmStrike, currentPrice }: IVChartProps) => {

  return (
    <Card className="p-3">
      <h2 className="text-base font-bold mb-3">Implied Volatility Smile - ATM {atmStrike}</h2>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="strike" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            label={{ value: 'IV %', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="callIV" 
            stroke="hsl(var(--chart-1))" 
            fill="hsl(var(--chart-1))"
            fillOpacity={0.3}
            name="Call IV"
          />
          <Area 
            type="monotone" 
            dataKey="putIV" 
            stroke="hsl(var(--chart-2))" 
            fill="hsl(var(--chart-2))"
            fillOpacity={0.3}
            name="Put IV"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
