import { IndexedStakingSubgraphClient } from "@indexed-finance/subgraph-clients";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { pairsActions } from "../pairs";

export const fetchNewStakingData = createAsyncThunk(
  "newStaking/fetch",
  async (
    {
      provider,
    }: {
      provider:
        | ethers.providers.Web3Provider
        | ethers.providers.JsonRpcProvider
        | ethers.providers.InfuraProvider;
    },
    { dispatch }
  ) => {
    const { chainId } = provider.network;
    const name = chainId === 1 ? "mainnet" : "rinkeby";
    const client = IndexedStakingSubgraphClient.forNetwork(name);

    try {
      const data = await client.getStakingInfo();
      const { pools, ...meta } = data;
      const pairTokens = pools
        .filter((p) => p.isPairToken)
        .map(({ token: id, token0, token1 }) => ({
          id,
          exists: true,
          token0,
          token1,
        }));

      dispatch(pairsActions.uniswapPairsRegistered(pairTokens));

      return {
        meta,
        pools: pools.map(({ balance, isPairToken, ...pool }) => ({
          ...pool,
          totalStaked: balance,
          isWethPair: isPairToken,
          rewardsPerDay: "0",
        })),
      };
    } catch (error) {
      return null;
    }
  }
);
