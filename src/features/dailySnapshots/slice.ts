import { DailyPoolSnapshot } from "indexed-types";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { mirroredServerState, subgraphDataLoaded } from "features/actions";
import type { AppState } from "features/store";

export type SnapshotKey = keyof Omit<DailyPoolSnapshot, "date">;

const SECONDS_PER_DAY = 24 * 60 * 60;
const SECONDS_PER_WEEK = SECONDS_PER_DAY * 7;

const adapter = createEntityAdapter<DailyPoolSnapshot>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const slice = createSlice({
  name: "dailySnapshots",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(subgraphDataLoaded, (state, action) => {
        const { dailySnapshots } = action.payload;
        const fullSnapshots = dailySnapshots.ids.map(
          (id) => dailySnapshots.entities[id]
        );

        adapter.addMany(state, fullSnapshots);
      })
      .addCase(mirroredServerState, (_, action) => {
        const { dailySnapshots } = action.payload;

        return dailySnapshots;
      }),
});

export const { actions } = slice;

export const selectors = {
  ...adapter.getSelectors((state: AppState) => state.dailySnapshots),
  selectSortedSnapshotsOfPool: (
    state: AppState,
    poolId: string,
    direction: "asc" | "desc" = "asc"
  ) => {
    const snapshots = selectors
      .selectAll(state)
      .filter((dailySnapshot) => dailySnapshot.id.includes(poolId));

    return [...snapshots].sort((left, right) =>
      direction === "asc" ? left.date - right.date : right.date - left.date
    );
  },
  selectSortedSnapshotsOfPoolInTimeframe: (
    state: AppState,
    poolId: string,
    maxAgeInSeconds: number
  ) => {
    const snapshots = selectors.selectSortedSnapshotsOfPool(
      state,
      poolId,
      "asc"
    );
    const unixNow = Date.now() / 1000;
    return [...snapshots].filter(
      (snapshot) => unixNow - snapshot.date <= maxAgeInSeconds
    );
  },
  selectTimeSeriesSnapshotData: (
    state: AppState,
    poolId: string,
    timeframe: "Day" | "Week",
    key: SnapshotKey
  ) => {
    const maxAgeInSeconds = timeframe === "Day" ? 86400 : 604800;
    const snapshots = selectors.selectSortedSnapshotsOfPoolInTimeframe(
      state,
      poolId,
      maxAgeInSeconds
    );
    const timeSeriesData = snapshots.map((snapshot) => ({
      time: snapshot.date,
      value: snapshot[key],
    }));
    return timeSeriesData;
  },
  selectMostRecentSnapshotOfPool: (state: AppState, poolId: string) => {
    const snapshots = selectors.selectSortedSnapshotsOfPool(
      state,
      poolId,
      "desc"
    );
    const mostRecent = snapshots[0];
    return mostRecent;
  },
  selectSnapshotPeriodsForPool: (state: AppState, poolId: string) => {
    const allSnapshots = selectors.selectSortedSnapshotsOfPoolInTimeframe(
      state,
      poolId,
      86400 // one day
    );
    const mostRecentSnapshot = selectors.selectMostRecentSnapshotOfPool(
      state,
      poolId
    );
    const fromLast24Hours = allSnapshots.filter(
      (snapshot) => snapshot.date >= mostRecentSnapshot.date - SECONDS_PER_DAY
    );
    const fromLastWeek = allSnapshots.filter(
      (snapshot) => snapshot.date >= mostRecentSnapshot.date - SECONDS_PER_WEEK
    );

    return {
      last24Hours: fromLast24Hours,
      lastWeek: fromLastWeek,
    };
  },
  selectPoolDeltas: (state: AppState, poolId: string) => {
    const mostRecentSnapshot = selectors.selectMostRecentSnapshotOfPool(
      state,
      poolId
    );
    const { last24Hours, lastWeek } = selectors.selectSnapshotPeriodsForPool(
      state,
      poolId
    );
    const volumeLast24Hours =
      parseFloat(mostRecentSnapshot.totalVolumeUSD) -
      parseFloat(last24Hours[0].totalVolumeUSD);

    // Values
    const priceDelta24Hours = mostRecentSnapshot.value - last24Hours[0].value;
    const priceDeltaWeek = mostRecentSnapshot.value - lastWeek[0].value;
    const totalValueLockedUSDDelta24Hours =
      mostRecentSnapshot.totalValueLockedUSD -
      last24Hours[0].totalValueLockedUSD;
    const totalValueLockedUSDDeltaWeek =
      mostRecentSnapshot.totalValueLockedUSD - lastWeek[0].totalValueLockedUSD;

    // Percents
    const pricePercentDelta24Hours = priceDelta24Hours / last24Hours[0].value;
    const pricePercentDeltaWeek = priceDeltaWeek / lastWeek[0].value;
    const totalValueLockedUSDPercentDelta24Hours =
      totalValueLockedUSDDelta24Hours / last24Hours[0].totalValueLockedUSD;
    const totalValueLockedUSDPercentDeltaWeek =
      totalValueLockedUSDDeltaWeek / lastWeek[0].totalValueLockedUSD;

    return {
      volume: {
        day: volumeLast24Hours,
      },
      price: {
        day: {
          value: priceDelta24Hours,
          percent: pricePercentDelta24Hours,
        },
        week: {
          value: priceDeltaWeek,
          percent: pricePercentDeltaWeek,
        },
      },
      totalValueLockedUSD: {
        day: {
          value: totalValueLockedUSDDelta24Hours,
          percent: totalValueLockedUSDPercentDelta24Hours,
        },
        week: {
          value: totalValueLockedUSDDeltaWeek,
          percent: totalValueLockedUSDPercentDeltaWeek,
        },
      },
    };
  },
  selectPoolStats: (state: AppState, poolId: string) => {
    const mostRecentSnapshot = selectors.selectMostRecentSnapshotOfPool(
      state,
      poolId
    );
    const deltas = selectors.selectPoolDeltas(state, poolId);

    return {
      marketCap: parseFloat(mostRecentSnapshot.totalValueLockedUSD),
      price: parseFloat(mostRecentSnapshot.value),
      deltas,
      supply: parseFloat(mostRecentSnapshot.totalSupply),
    };
  },
};

export default slice.reducer;
