import * as supgraphQueries from "helpers/subgraph-queries";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { normalizeInitialData } from "ethereum";

export const fetchInitialData = createAsyncThunk(
  "requests/initial-data",
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
    const initial = await supgraphQueries.queryInitial(url);
    const formattedInitialData = normalizeInitialData(initial);

    return formattedInitialData;
  }
);
