import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useEconomicCalendar } from "@/hooks/useEconomicCalendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { BottomTabBar } from "@/components/BottomTabBar";

const EconomicCalendar = () => {
  const { data, isLoading, error } = useEconomicCalendar();
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedImpact, setSelectedImpact] = useState<string>("all");

  if (isLoading) {
    return (
       <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
         <BottomTabBar />
      </div>
    );
  }

  if (error) {
    return (
       <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-destructive">Error loading economic calendar data</div>
        </div>
         <BottomTabBar />
      </div>
    );
  }

  const events = data?.events || [];
  const countries = ["all", ...Array.from(new Set(events.map(e => e.country)))];
  
  const filteredEvents = events.filter(event => {
    const matchesCountry = selectedCountry === "all" || event.country === selectedCountry;
    const matchesImpact = selectedImpact === "all" || event.impact === selectedImpact;
    return matchesCountry && matchesImpact;
  });

  const getImpactVariant = (impact: string) => {
    switch (impact) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  return (
     <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Economic Calendar</h1>
          <p className="text-muted-foreground">
            Track major economic events and their impact on the market
          </p>
        </div>

        <Card className="p-2 md:p-6">
          <div className="flex gap-2 md:gap-4 mb-4 md:mb-6">
            <div className="flex-1">
              <label className="text-[8px] md:text-sm font-medium mb-1 md:mb-2 block">Country</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="h-7 md:h-10 text-[8px] md:text-sm">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[8px] md:text-sm">All Countries</SelectItem>
                  {countries.filter(c => c !== "all").map(country => (
                    <SelectItem key={country} value={country} className="text-[8px] md:text-sm">{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-[8px] md:text-sm font-medium mb-1 md:mb-2 block">Impact</label>
              <Select value={selectedImpact} onValueChange={setSelectedImpact}>
                <SelectTrigger className="h-7 md:h-10 text-[8px] md:text-sm">
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[8px] md:text-sm">All Impact Levels</SelectItem>
                  <SelectItem value="Low" className="text-[8px] md:text-sm">Low</SelectItem>
                  <SelectItem value="Medium" className="text-[8px] md:text-sm">Medium</SelectItem>
                  <SelectItem value="High" className="text-[8px] md:text-sm">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[8px] md:text-sm">Date</TableHead>
                  <TableHead className="text-[8px] md:text-sm">Country</TableHead>
                  <TableHead className="text-[8px] md:text-sm">Event</TableHead>
                  <TableHead className="text-[8px] md:text-sm">Impact</TableHead>
                  <TableHead className="text-right text-[8px] md:text-sm">Expected</TableHead>
                  <TableHead className="text-right text-[8px] md:text-sm">Actual</TableHead>
                  <TableHead className="text-right text-[8px] md:text-sm">Previous</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium whitespace-nowrap text-[8px] md:text-sm p-1 md:p-4">
                      {formatDate(event.date)}
                    </TableCell>
                    <TableCell className="text-[8px] md:text-sm p-1 md:p-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <span className="text-sm md:text-2xl">{event.flag}</span>
                        <span>{event.country}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[8px] md:text-sm p-1 md:p-4">{event.event}</TableCell>
                    <TableCell className="p-1 md:p-4">
                      <Badge variant={getImpactVariant(event.impact)} className="text-[6px] md:text-xs px-1 md:px-2 py-0 md:py-0.5">
                        {event.impact}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-[8px] md:text-sm p-1 md:p-4">{event.expected}</TableCell>
                    <TableCell className="text-right font-semibold text-[8px] md:text-sm p-1 md:p-4">{event.actual}</TableCell>
                    <TableCell className="text-right text-[8px] md:text-sm p-1 md:p-4">{event.previous}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
       <BottomTabBar />
    </div>
  );
};

export default EconomicCalendar;
