import * as coingeckoQueries from "helpers/coingecko-queries";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchTokenStats = createAsyncThunk(
  "requests/token-stats",
  async ({ arg: tokenAddresses }: { arg: string[] }) => {
    const tokens = await coingeckoQueries.getStatsForTokens(tokenAddresses);
    return tokens;
  }
);
