import { IndexedDividendsSubgraphClient } from "@indexed-finance/subgraph-clients";
import { createAsyncThunk } from "@reduxjs/toolkit";

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

    try {
      const timelocks = await client.getLocksByOwner(userId);

      return [timelocks];
    } catch (error) {
      console.error({ error });

      return [];
    }
  }
);
