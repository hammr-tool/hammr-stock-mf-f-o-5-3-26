import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { useFIIDIIData } from "@/hooks/useFIIDIIData";

const ValueCell = ({ value, label }: { value: number; label?: string }) => (
  <div className={`flex items-center justify-between ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
    {label && <span className="text-muted-foreground text-xs">{label}</span>}
    <div className="flex items-center gap-1 font-medium">
      {value >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      ₹{Math.abs(value).toFixed(2)} Cr
    </div>
  </div>
);

export const LiveFIIDIIData = () => {
  const { data, isLoading, error } = useFIIDIIData();

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
          Unable to load FII/DII data
        </div>
      </Card>
    );
  }

  const { fiiData, diiData } = data;

  return (
    <Card className="p-2 md:p-4">
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        {/* FII Activity - Left Side */}
        <div>
          <h2 className="text-xs md:text-lg font-bold mb-2 md:mb-3 border-b pb-1 md:pb-2">FII Activity</h2>
          <div className="space-y-1 md:space-y-2">
            {fiiData.slice(0, 5).map((item, idx) => {
              const total = (item.index || 0) + item.debt + item.hybrid;
              return (
                <div key={idx} className="border-b pb-1 md:pb-2 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] md:text-sm font-medium">{item.date}</span>
                    <div className={`flex items-center gap-0.5 md:gap-1 text-[8px] md:text-sm font-semibold ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {total >= 0 ? <ArrowUp className="h-2.5 w-2.5 md:h-4 md:w-4" /> : <ArrowDown className="h-2.5 w-2.5 md:h-4 md:w-4" />}
                      ₹{Math.abs(total).toFixed(2)}Cr
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DII Activity - Right Side */}
        <div>
          <h2 className="text-xs md:text-lg font-bold mb-2 md:mb-3 border-b pb-1 md:pb-2">DII Activity</h2>
          <div className="space-y-1 md:space-y-2">
            {diiData.slice(0, 5).map((item, idx) => {
              const total = (item.equity || 0) + item.debt + item.hybrid;
              return (
                <div key={idx} className="border-b pb-1 md:pb-2 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] md:text-sm font-medium">{item.date}</span>
                    <div className={`flex items-center gap-0.5 md:gap-1 text-[8px] md:text-sm font-semibold ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {total >= 0 ? <ArrowUp className="h-2.5 w-2.5 md:h-4 md:w-4" /> : <ArrowDown className="h-2.5 w-2.5 md:h-4 md:w-4" />}
                      ₹{Math.abs(total).toFixed(2)}Cr
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
