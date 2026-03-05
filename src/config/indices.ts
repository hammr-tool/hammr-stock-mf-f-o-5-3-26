export interface IndexConfig {
  name: string;
  symbol: string;
  strikeInterval: number;
}

export const INDICES: IndexConfig[] = [
  { name: 'NIFTY 50', symbol: '^NSEI', strikeInterval: 50 },
  { name: 'SENSEX', symbol: '^BSESN', strikeInterval: 100 },
  { name: 'NIFTY BANK', symbol: '^NSEBANK', strikeInterval: 100 },
  { name: 'NIFTY IT', symbol: '^CNXIT', strikeInterval: 50 },
  { name: 'NIFTY FMCG', symbol: '^CNXFMCG', strikeInterval: 50 },
  { name: 'NIFTY PHARMA', symbol: '^CNXPHARMA', strikeInterval: 50 },
];
