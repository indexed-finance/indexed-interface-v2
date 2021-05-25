import { IndexedStakingSubgraphClient } from '@indexed-finance/subgraph-clients';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";

export const fetchNewStakingData = createAsyncThunk(
  "newStaking/fetch",
  async ({
    provider,
  }: {
    provider:
      | ethers.providers.Web3Provider
      | ethers.providers.JsonRpcProvider
      | ethers.providers.InfuraProvider;
  }) => {
    const { chainId } = provider.network;
    const name = chainId === 1 ? 'mainnet' : 'rinkeby';
    const client = IndexedStakingSubgraphClient.forNetwork(name);

    const data = await client.getStakingInfo();
    const { pools, ...meta } = data;
    return {
      meta,
      pools: pools.map(
        ({ balance, isPairToken, ...pool }) => ({
          ...pool,
          totalStaked: balance,
          isWethPair: isPairToken,
          rewardsPerDay: '0'
      }))
    }
  }
);
