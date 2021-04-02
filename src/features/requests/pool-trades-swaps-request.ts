import * as supgraphQueries from "helpers/subgraph-queries";
import { SUBGRAPH_URL_UNISWAP } from "config";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import type { Swap as PoolSwap } from "indexed-types";
import type { Swap as PoolTrade } from "uniswap-types";

export const fetchPoolTradesSwaps = createAsyncThunk(
  "requests/pool-trades-swaps",
  async ({
    provider,
    arg: poolAddresses,
  }: {
    provider:
      | ethers.providers.Web3Provider
      | ethers.providers.JsonRpcProvider
      | ethers.providers.InfuraProvider;
    arg: string[];
  }) => {
    const { chainId } = await provider.getNetwork();
    const url = supgraphQueries.getUrl(chainId);
    const [trades, swaps] = await Promise.all([
      supgraphQueries.queryTradesForPools(SUBGRAPH_URL_UNISWAP, poolAddresses),
      supgraphQueries.querySwapsForPools(url, poolAddresses),
    ]);
    const formattedTradesAndSwaps = poolAddresses.reduce(
      (prev, next) => {
        prev[next] = {
          trades: trades[next],
          swaps: swaps[next],
        };

        return prev;
      },
      {} as Record<
        string,
        {
          trades: PoolTrade[];
          swaps: PoolSwap[];
        }
      >
    );

    return formattedTradesAndSwaps;
  }
);
