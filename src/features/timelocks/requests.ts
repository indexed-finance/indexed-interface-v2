import { IndexedDividendsSubgraphClient } from "@indexed-finance/subgraph-clients";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { TimeLockData } from "./types";

export const fetchTimelocksMetadata = createAsyncThunk(
  "timelocks/metadata/fetch",
  async () => {
    const client = IndexedDividendsSubgraphClient.forNetwork("mainnet");

    try {
      const metadata = await client.getData();

      return metadata;
    } catch (error) {
      console.error({ error });

      return null;
    }
  }
);

export const fetchTimelockData = createAsyncThunk(
  "timelocks/fetch",
  async (timelockId: string) => {
    const client = IndexedDividendsSubgraphClient.forNetwork("mainnet");

    try {
      const timelock = await client.getLock(timelockId);

      return timelock;
    } catch (error) {
      console.error({ error });

      return null;
    }
  }
);

export const fetchUserTimelocks = createAsyncThunk(
  "timelocks/user/fetch",
  async (userId: string) => {
    const client = IndexedDividendsSubgraphClient.forNetwork("mainnet");
    if (!client) return null;
    try {
      const timelocks = (await (client.getLocksByOwner(
        userId
      ) as unknown)) as TimeLockData[];

      return timelocks;
    } catch (error) {
      console.error({ error });

      return [];
    }
  }
);
