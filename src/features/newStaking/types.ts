export type NewStakingPool = {
  id: string;
  token: string;
  symbol: string;
  name: string;
  decimals: number;
  totalStaked: string;
  isPairToken: boolean;
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

export type NewStakingMeta = {
  id: string;
  owner: string;
  rewardsSchedule: string;
  startBlock: number;
  endBlock: number;
  rewardsToken: string;
  totalAllocPoint: number;
  poolCount: number;
}