import { NirnSubgraphClient } from "@indexed-finance/subgraph-clients";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";

export const fetchVaultsData = createAsyncThunk(
  "vaults/fetch",
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
    const client = NirnSubgraphClient.forNetwork(name);

    try {
      const vaults = await client.getAllVaults();

      return vaults;
    } catch (error) {
      console.error({ error });

      return null;
    }
  }
);
