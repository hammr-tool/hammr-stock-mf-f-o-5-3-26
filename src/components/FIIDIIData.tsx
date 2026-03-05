import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

const fiiData = [
  { date: "10 Oct 2025", index: 2456.78, debt: -1234.56, hybrid: 234.67 },
  { date: "09 Oct 2025", index: 3456.12, debt: -567.89, hybrid: 456.78 },
  { date: "08 Oct 2025", index: -1234.56, debt: 890.12, hybrid: -123.45 },
  { date: "07 Oct 2025", index: 4567.89, debt: -234.56, hybrid: 678.90 },
];

const diiData = [
  { date: "10 Oct 2025", equity: -3456.78, debt: 2345.67, hybrid: 567.89 },
  { date: "09 Oct 2025", equity: -4567.89, debt: 3456.78, hybrid: 678.90 },
  { date: "08 Oct 2025", equity: 2345.67, debt: -1234.56, hybrid: -234.56 },
  { date: "07 Oct 2025", equity: -5678.90, debt: 4567.89, hybrid: 789.01 },
];

const ValueCell = ({ value }: { value: number }) => (
  <div className={`flex items-center gap-0.5 text-[7px] whitespace-nowrap ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
    {value >= 0 ? <ArrowUp className="h-2 w-2" /> : <ArrowDown className="h-2 w-2" />}
    ₹{Math.abs(value).toFixed(2)}Cr
  </div>
);

export const FIIDIIData = () => {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <Card className="p-3">
        <h2 className="text-xs font-bold mb-2">FII Activity</h2>
        <div className="space-y-1.5">
          {fiiData.map((data) => (
            <div key={data.date} className="border-b pb-1.5 last:border-0">
              <div className="text-[7px] font-medium mb-1 whitespace-nowrap">{data.date}</div>
              <div className="grid grid-cols-3 gap-1">
                <div>
                  <div className="text-muted-foreground text-[7px] mb-0.5">Index</div>
                  <ValueCell value={data.index} />
                </div>
                <div>
                  <div className="text-muted-foreground text-[7px] mb-0.5">Debt</div>
                  <ValueCell value={data.debt} />
                </div>
                <div>
                  <div className="text-muted-foreground text-[7px] mb-0.5">Hybrid</div>
                  <ValueCell value={data.hybrid} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-3">
        <h2 className="text-xs font-bold mb-2">DII Activity</h2>
        <div className="space-y-1.5">
          {diiData.map((data) => (
            <div key={data.date} className="border-b pb-1.5 last:border-0">
              <div className="text-[7px] font-medium mb-1 whitespace-nowrap">{data.date}</div>
              <div className="grid grid-cols-3 gap-1">
                <div>
                  <div className="text-muted-foreground text-[7px] mb-0.5">Equity</div>
                  <ValueCell value={data.equity} />
                </div>
                <div>
                  <div className="text-muted-foreground text-[7px] mb-0.5">Debt</div>
                  <ValueCell value={data.debt} />
                </div>
                <div>
                  <div className="text-muted-foreground text-[7px] mb-0.5">Hybrid</div>
                  <ValueCell value={data.hybrid} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
