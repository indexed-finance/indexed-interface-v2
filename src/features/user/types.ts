export interface NormalizedUserStakingData {
  balance: string;
  earned: string;
}

export interface NormalizedUser {
  address: string;
  allowances: Record<
    string /* <poolId>-<tokenId> */,
    string /* Token Balance */
  >;
  balances: Record<string /* <tokenId> */, string /* Token Balance */>;
  staking: Record<string /* <stakingPoolId> */, NormalizedUserStakingData>;
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
  staking?: string;
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
  isSushiswapPair: boolean;
  balance: string;
  ndxEarned: string;
  sushiEarned?: string;
  price: string;
  value: string;
  weight: string;
  link: string;
}
