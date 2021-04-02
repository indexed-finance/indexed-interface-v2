import * as supgraphQueries from "helpers/subgraph-queries";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { normalizeStakingData } from "ethereum";

export const fetchStakingData = createAsyncThunk(
  "requests/staking-data",
  async ({
    provider,
  }: {
    provider:
      | ethers.providers.Web3Provider
      | ethers.providers.JsonRpcProvider
      | ethers.providers.InfuraProvider;
  }) => {
    const { chainId } = provider.network;
    const url = supgraphQueries.getUrl(chainId);
    const staking = await supgraphQueries.queryStaking(url);
    const formattedStakingData = normalizeStakingData(staking);

    return formattedStakingData;
  }
);
