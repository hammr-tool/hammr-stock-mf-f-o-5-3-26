import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IntradayDataPoint } from "@/hooks/useLiveChartData";

interface IndexPriceChartProps {
  data: IntradayDataPoint[];
  indexName: string;
}

export const IndexPriceChart = ({ data, indexName }: IndexPriceChartProps) => {
  return (
    <Card className="p-3">
      <h2 className="text-base font-bold mb-3">Intraday Price Chart - {indexName}</h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke="hsl(var(--primary))" 
            name="Price"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
