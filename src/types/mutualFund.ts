export interface MutualFund {
  schemeCode: string;
  schemeName: string;
  nav: number;
  date: string;
  fundHouse: string;
  schemeType: string;
  schemeCategory: string;
  return1Y: number;
  return3Y: number;
  return5Y: number;
  rating: number;
  aum: number;
  expenseRatio: number;
}

export interface MutualFundDetail extends MutualFund {
  minInvestment: number;
  minSIP: number;
  exitLoad: string;
  benchmark: string;
  riskLevel: string;
}

export interface MutualFundResponse {
  funds: MutualFund[];
  total: number;
  page: number;
  totalPages: number;
  fundHouses: string[];
  categories: string[];
}
