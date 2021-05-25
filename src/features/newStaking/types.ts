export type NewStakingPool = {
  id: string;
  token: string;
  symbol: string;
  name: string;
  decimals: number;
  totalStaked: string;
  isWethPair: boolean;
  token0?: string;
  token1?: string;
  allocPoint: number;
  lastRewardBlock: number;
  userCount: number;
  updatedAt: number;
  rewardsPerDay: string;

  userStakedBalance?: string;
  userEarnedRewards?: string;
}

export type NewStakingPoolUpdate = {
  id: string;
  totalStaked: string;
  userStakedBalance?: string;
  userEarnedRewards?: string;
}

export type NewStakingPoolUserUpdate = {
  userStakedBalance?: string;
  userEarnedRewards?: string;
}

export type NewStakingUpdate = {
  totalStakedByToken: Record<string, string>;
  userDataByPool: Record<string, NewStakingPoolUserUpdate>
  totalRewardsPerDay: string;
}

export type NewStakingMeta = {
  id: string;
  owner: string;
  rewardsSchedule: string;
  startBlock: number;
  endBlock: number;
  rewardsToken: string;
  totalAllocPoint: number;
  poolCount: number;
  totalRewardsPerDay?: string;
}

export interface FormattedNewStakingData {
  id: string;
  slug: string;
  name: string;
  symbol: string;
  staked: string;
  stakingToken: string;
  earned: string;
  rewardsPerDay: string;
  isWethPair: boolean;
  indexPool: string;
  totalStaked: string;
}

export interface FormattedNewStakingDetail {
  indexTokens: FormattedNewStakingData[];
  liquidityTokens: FormattedNewStakingData[];
}