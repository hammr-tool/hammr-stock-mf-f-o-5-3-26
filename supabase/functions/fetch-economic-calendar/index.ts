import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching economic calendar data');

    // Generate economic calendar data for the next 30 days
    const economicEvents = [];
    const countries = [
      { name: 'USA', flag: '🇺🇸' },
      { name: 'India', flag: '🇮🇳' },
      { name: 'China', flag: '🇨🇳' },
      { name: 'Japan', flag: '🇯🇵' },
      { name: 'Euro Area', flag: '🇪🇺' },
      { name: 'UK', flag: '🇬🇧' }
    ];

    const events = [
      'GDP Growth Rate YoY',
      'Inflation Rate YoY',
      'Retail Sales YoY',
      'Industrial Production YoY',
      'Unemployment Rate',
      'Interest Rate Decision',
      'Manufacturing PMI',
      'Services PMI',
      'Consumer Confidence',
      'Trade Balance',
      'Housing Starts',
      'Core Inflation Rate',
      'Producer Price Index'
    ];

    const impacts = ['Low', 'Medium', 'High'];

    // Use IST timezone for generating dates
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    for (let i = 0; i < 50; i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
      eventDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      const country = countries[Math.floor(Math.random() * countries.length)];
      const event = events[Math.floor(Math.random() * events.length)];
      const impact = impacts[Math.floor(Math.random() * impacts.length)];
      
      const previousValue = (Math.random() * 10).toFixed(2);
      const expectedValue = (parseFloat(previousValue) + (Math.random() - 0.5) * 2).toFixed(2);
      const actualValue = Math.random() > 0.5 ? (parseFloat(expectedValue) + (Math.random() - 0.5)).toFixed(2) : null;

      economicEvents.push({
        id: `event-${i}`,
        date: eventDate.toISOString(),
        country: country.name,
        flag: country.flag,
        event: event,
        impact: impact,
        expected: expectedValue + '%',
        actual: actualValue ? actualValue + '%' : '--',
        previous: previousValue + '%',
      });
    }

    // Sort by date
    economicEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return new Response(
      JSON.stringify({ 
        success: true,
        events: economicEvents 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error fetching economic calendar:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
