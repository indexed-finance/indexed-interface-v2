import { MasterChefSubgraphClient } from "@indexed-finance/subgraph-clients";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";

export const fetchMasterChefData = createAsyncThunk(
  "masterChef/fetch",
  async ({
    provider,
  }: {
    provider:
      | ethers.providers.Web3Provider
      | ethers.providers.JsonRpcProvider
      | ethers.providers.InfuraProvider;
  }) => {
    const { chainId } = provider.network;

    const name = chainId === 1 ? "mainnet" : "rinkeby";
    const client = MasterChefSubgraphClient.forNetwork(name);

    try {
      const data = await client.getStakingInfo();
      const { pools, ...meta } = data;

      return {
        meta,
        pools: pools.map(({ balance, ...pool }) => ({
          ...pool,
          totalStaked: balance,
        })),
      };
    } catch (error) {
      return null;
    }
  }
);
