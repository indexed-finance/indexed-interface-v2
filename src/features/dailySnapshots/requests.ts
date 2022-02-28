import { IndexedCoreSubgraphClient } from "@indexed-finance/subgraph-clients";
import { NETWORKS_BY_ID } from "../../config";
import { Timeframe } from "./selectors";
import { createAsyncThunk } from "@reduxjs/toolkit";

const ONE_DAY = 24;
const TIMEFRAME_TO_HOURS: Record<Timeframe, number> = {
  "1D": ONE_DAY,
  "1W": ONE_DAY * 7,
  "2W": ONE_DAY * 14,
  "1M": ONE_DAY * 30,
  "3M": ONE_DAY * 90,
  "6M": ONE_DAY * 180,
  "1Y": ONE_DAY * 365,
};

export const fetchSnapshotsData = createAsyncThunk(
  "dailySnapshots/fetch",
  async ({ poolId, timeframe }: { poolId: string; timeframe: Timeframe }, { getState }) => {
    const state = getState();
    const chainId = (state as any).settings.network
    const network = NETWORKS_BY_ID[chainId].name;
    const client = IndexedCoreSubgraphClient.forNetwork(network);
    const hours = TIMEFRAME_TO_HOURS[timeframe];

    try {
      const snapshots = await client.getPoolSnapshots(poolId, hours);

      return snapshots;
    } catch (error) {
      console.error({ error });

      return [];
    }
  }
);
