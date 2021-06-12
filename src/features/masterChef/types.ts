export type MasterChefPool = {
  id: string;
  token: string;
  totalStaked: string;
  allocPoint: number;
  lastRewardBlock: number;
  userCount: number;
  updatedAt: number;
  userStakedBalance?: string;
  userEarnedRewards?: string;
};

export type MasterChefPoolUpdate = {
  id: string;
  totalStaked: string;
  userStakedBalance?: string;
  userEarnedRewards?: string;
};

export type MasterChefPoolUserUpdate = {
  userStakedBalance?: string;
  userEarnedRewards?: string;
};

export type MasterChefUpdate = {
  totalStakedByToken: Record<string, string>;
  userDataByPool: Record<string, MasterChefPoolUserUpdate>;
  allocPointsByPool: Record<string, number>;
  totalAllocPoint: number;
};

export type MasterChefMeta = {
  totalAllocPoint: number;
  poolCount: number;
};

export interface FormattedMasterChefData {
  id: string;
  slug?: string;
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

export interface FormattedMasterChefStakingDetail {
  indexTokens: FormattedMasterChefData[];
  liquidityTokens: FormattedMasterChefData[];
}
