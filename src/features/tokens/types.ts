export interface NormalizedToken {
  id: string;
  decimals: number;
  name?: string;
  symbol: string;
  totalSupply?: string;
  priceData?: {
    price?: number;
    change24Hours?: number;
    percentChange24Hours?: number;
  };
}
