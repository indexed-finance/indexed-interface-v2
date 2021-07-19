import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { getIndexedUrl, sendQuery } from "helpers";
import type { NdxStakingPool } from "indexed-types";
import type { NormalizedStakingPool } from "../staking";

export async function queryStaking(url: string): Promise<NdxStakingPool[]> {
  const { ndxStakingPools: staking } = await sendQuery(
    url,
    `
      {
        ndxStakingPools(first: 20) {
          id
          indexPool
          stakingToken
          isWethPair
          startsAt
          periodFinish
          totalSupply
          lastUpdateTime
          totalRewards
          claimedRewards
          rewardRate
          rewardPerTokenStored
        }
      }
      `
  );
  return staking;
}

export function normalizeStakingData(
  data: NdxStakingPool[]
): NormalizedStakingPool[] {
  return data.map((pool) => {
    return {
      id: pool.id,
      rewardsDuration: 0,
      periodFinish: pool.periodFinish,
      rewardRate: pool.rewardRate,
      rewardPerTokenStored: pool.rewardPerTokenStored,
      totalSupply: pool.totalSupply,
      stakingToken: pool.stakingToken,
      indexPool: pool.indexPool,
      isWethPair: pool.isWethPair,
      startsAt: pool.startsAt,
      totalRewards: pool.totalRewards,
    };
  });
}

export const fetchStakingData = createAsyncThunk(
  "staking/fetch",
  async ({
    provider,
  }: {
    provider:
      | ethers.providers.Web3Provider
      | ethers.providers.JsonRpcProvider
      | ethers.providers.InfuraProvider;
  }) => {
    const { chainId } = provider.network;
    const url = getIndexedUrl(chainId);

    try {
      const staking = await queryStaking(url);
      const formattedStakingData = normalizeStakingData(staking);

      return formattedStakingData;
    } catch (error) {
      return [];
    }
  }
);
