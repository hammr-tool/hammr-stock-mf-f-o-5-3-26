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
    console.log('Fetching holiday calendar data');

    const holidays = [
      // 2025 Holidays
      {
        id: 'h1',
        date: '2025-01-26',
        name: 'Republic Day',
        market: 'NSE, BSE',
        type: 'National Holiday'
      },
      {
        id: 'h2',
        date: '2025-03-14',
        name: 'Holi',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h3',
        date: '2025-03-31',
        name: 'Id-Ul-Fitr',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h4',
        date: '2025-04-10',
        name: 'Mahavir Jayanti',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h5',
        date: '2025-04-14',
        name: 'Dr. Ambedkar Jayanti',
        market: 'NSE, BSE',
        type: 'National Holiday'
      },
      {
        id: 'h6',
        date: '2025-04-18',
        name: 'Good Friday',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h7',
        date: '2025-05-01',
        name: 'Maharashtra Day',
        market: 'BSE',
        type: 'State Holiday'
      },
      {
        id: 'h8',
        date: '2025-06-06',
        name: 'Id-Ul-Zuha',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h9',
        date: '2025-07-05',
        name: 'Muharram',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h10',
        date: '2025-08-15',
        name: 'Independence Day',
        market: 'NSE, BSE',
        type: 'National Holiday'
      },
      {
        id: 'h11',
        date: '2025-08-27',
        name: 'Ganesh Chaturthi',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h12',
        date: '2025-09-04',
        name: 'Milad-Un-Nabi',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h13',
        date: '2025-10-02',
        name: 'Mahatma Gandhi Jayanti',
        market: 'NSE, BSE',
        type: 'National Holiday'
      },
      {
        id: 'h14',
        date: '2025-10-02',
        name: 'Dussehra',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h15',
        date: '2025-10-21',
        name: 'Diwali Laxmi Pujan',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h16',
        date: '2025-10-22',
        name: 'Diwali Balipratipada',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h17',
        date: '2025-11-05',
        name: 'Guru Nanak Jayanti',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h18',
        date: '2025-12-25',
        name: 'Christmas',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      // 2026 Holidays
      {
        id: 'h19',
        date: '2026-01-26',
        name: 'Republic Day',
        market: 'NSE, BSE',
        type: 'National Holiday'
      },
      {
        id: 'h20',
        date: '2026-03-03',
        name: 'Holi',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h21',
        date: '2026-03-20',
        name: 'Id-Ul-Fitr',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h22',
        date: '2026-03-30',
        name: 'Mahavir Jayanti',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h23',
        date: '2026-04-03',
        name: 'Good Friday',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h24',
        date: '2026-04-14',
        name: 'Dr. Ambedkar Jayanti',
        market: 'NSE, BSE',
        type: 'National Holiday'
      },
      {
        id: 'h25',
        date: '2026-05-01',
        name: 'Maharashtra Day',
        market: 'BSE',
        type: 'State Holiday'
      },
      {
        id: 'h26',
        date: '2026-05-27',
        name: 'Id-Ul-Zuha (Bakri Id)',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h27',
        date: '2026-06-25',
        name: 'Muharram',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h28',
        date: '2026-08-15',
        name: 'Independence Day',
        market: 'NSE, BSE',
        type: 'National Holiday'
      },
      {
        id: 'h29',
        date: '2026-08-17',
        name: 'Ganesh Chaturthi',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h30',
        date: '2026-08-25',
        name: 'Milad-Un-Nabi',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h31',
        date: '2026-10-02',
        name: 'Mahatma Gandhi Jayanti',
        market: 'NSE, BSE',
        type: 'National Holiday'
      },
      {
        id: 'h32',
        date: '2026-10-20',
        name: 'Dussehra',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h33',
        date: '2026-11-09',
        name: 'Diwali Laxmi Pujan',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h34',
        date: '2026-11-10',
        name: 'Diwali Balipratipada',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h35',
        date: '2026-11-24',
        name: 'Guru Nanak Jayanti',
        market: 'NSE, BSE',
        type: 'Festival'
      },
      {
        id: 'h36',
        date: '2026-12-25',
        name: 'Christmas',
        market: 'NSE, BSE',
        type: 'Festival'
      }
    ];

    return new Response(
      JSON.stringify({ 
        success: true,
        holidays: holidays 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error fetching holiday calendar:', error);
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
