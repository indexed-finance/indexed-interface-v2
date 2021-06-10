export interface StakingPoolUpdate {
  id: string; // Staking pool address
  rewardsDuration: number;
  periodFinish: number;
  rewardRate: string;
  rewardPerTokenStored: string;
  totalSupply: string; // Total amount of tokens staked
  userData?: {
    userAddress: string;
    userStakedBalance: string;
    userRewardsEarned: string;
  };
}

export interface NormalizedStakingPool extends StakingPoolUpdate {
  stakingToken: string; // Address of token being staked
  indexPool: string; // Address of related index pool
  isWethPair: boolean; // Whether the pool is for a UNI LP pair
  /** Unix timestamp for when staking pool begins */
  startsAt: number;
  totalRewards: string;
}

export interface FormattedStakingData {
  id: string;
  slug: string;
  name: string;
  symbol: string;
  staked: string;
  stakingToken: string;
  periodFinish: number;
  earned: string;
  rate: string;
  isWethPair: boolean;
  expired: boolean;
  totalStaked: string;
  liquidityProvider?: string;
}

export interface FormattedStakingDetail {
  indexTokens: FormattedStakingData[];
  liquidityTokens: FormattedStakingData[];
}
