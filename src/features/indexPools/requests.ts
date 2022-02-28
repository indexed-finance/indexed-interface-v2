import { IndexedCoreSubgraphClient, UniswapSubgraphClient } from "@indexed-finance/subgraph-clients";
import { NETWORKS_BY_ID, WETH_ADDRESS } from "config";
import { NormalizedIndexPoolTransactions } from ".";
import { computeUniswapPairAddress } from "helpers";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { OffChainRequest } from "../requests";

export const fetchIndexPoolUpdates = createAsyncThunk(
  "indexPools/fetchUpdates",
  async ({ provider, arg: poolAddresses = [] }: OffChainRequest) => {
    const { chainId } = await provider.getNetwork();
    const network = NETWORKS_BY_ID[chainId].name;
    const updates = await IndexedCoreSubgraphClient.forNetwork(network).getPoolUpdates(poolAddresses);
    return updates
  }
);

export const fetchIndexPoolTransactions = createAsyncThunk(
  "indexPools/fetchTransactions",
  async ({ provider, arg: poolAddresses = [] }: OffChainRequest) => {
    try {
      const { chainId } = await provider.getNetwork();
      const wethAddress = WETH_ADDRESS[chainId];
      const network = NETWORKS_BY_ID[chainId].name;
      const pairAddresses = poolAddresses.map(pool => computeUniswapPairAddress(pool, wethAddress, chainId).toLowerCase())
      const swaps = await IndexedCoreSubgraphClient.forNetwork(network as any).getSwaps(poolAddresses, 10);
      const trades = await UniswapSubgraphClient.forNetwork(network as any).getSwaps(pairAddresses, 10);
      return poolAddresses.reduce((prev, next, i) => ({
        [next]: {
          swaps: swaps[next],
          trades: trades[pairAddresses[i]]
        },
        ...prev
      }), {} as Record<string, NormalizedIndexPoolTransactions>)
    } catch (error) {
      console.log(`CAUGHT ERROR GETTING SWAPS`)
      console.log(error)
      return {};
    }
  }
);