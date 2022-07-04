export interface NormalizedUser {
  address: string;
  allowances: Record<
    string /* <poolId>-<tokenId> */,
    string /* Token Balance */
  >;
  balances: Record<string /* <tokenId> */, string /* Token Balance */>;
  ndx: null | string;
}

export type FormattedPortfolioDatum = {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  value: string;
  weight: string;
  link?: string;
  earned?: string;
  image?: string;
};

export interface FormattedPortfolioData {
  tokens: FormattedPortfolioDatum[];
  ndx?: FormattedPortfolioDatum;
  totalValue: string;
}

export interface FormattedPortfolioAsset {
  address: string;
  decimals: number;
  name: string;
  image: string;
  symbol: string;
  isUniswapPair: boolean;
  balance: string;
  ndxEarned: string;
  price: string;
  value: string;
  weight: string;
  link: string;
}
