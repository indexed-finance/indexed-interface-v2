export interface NormalizedToken {
  id: string;
  chainId: number;
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
