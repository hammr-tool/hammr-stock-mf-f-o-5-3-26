import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar } from "lucide-react";
import { useHolidayCalendar } from "@/hooks/useHolidayCalendar";
 import { BottomTabBar } from "@/components/BottomTabBar";

const HolidayCalendar = () => {
  const { data, isLoading, error } = useHolidayCalendar();

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
          <div className="text-destructive">Error loading holiday calendar data</div>
        </div>
         <BottomTabBar />
      </div>
    );
  }

  const holidays = data?.holidays || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
      timeZone: 'Asia/Kolkata'
    });
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'National Holiday': return 'destructive';
      case 'Festival': return 'default';
      case 'State Holiday': return 'secondary';
      default: return 'outline';
    }
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  const upcomingHolidays = holidays.filter(h => isUpcoming(h.date));
  const pastHolidays = holidays.filter(h => !isUpcoming(h.date));

  return (
     <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Market Holiday Calendar</h1>
          <p className="text-muted-foreground">
            Stock market holidays for NSE and BSE
          </p>
        </div>

        <div className="space-y-8">
          {upcomingHolidays.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Upcoming Holidays</h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Holiday</TableHead>
                      <TableHead>Market</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingHolidays.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {formatDate(holiday.date)}
                        </TableCell>
                        <TableCell className="font-semibold">{holiday.name}</TableCell>
                        <TableCell>{holiday.market}</TableCell>
                        <TableCell>
                          <Badge variant={getTypeVariant(holiday.type)}>
                            {holiday.type}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {pastHolidays.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Past Holidays</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Holiday</TableHead>
                      <TableHead>Market</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastHolidays.map((holiday) => (
                      <TableRow key={holiday.id} className="opacity-60">
                        <TableCell className="font-medium whitespace-nowrap">
                          {formatDate(holiday.date)}
                        </TableCell>
                        <TableCell>{holiday.name}</TableCell>
                        <TableCell>{holiday.market}</TableCell>
                        <TableCell>
                          <Badge variant={getTypeVariant(holiday.type)}>
                            {holiday.type}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      </main>
       <BottomTabBar />
    </div>
  );
};

export default HolidayCalendar;
