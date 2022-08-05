import { DailyPoolSnapshot } from 'indexed-types';
import { createEntityAdapter } from '@reduxjs/toolkit';
import type { AppState } from 'features/store';
import type { NormalizedDailySnapshot } from './types';

export const dailySnapshotsAdapter =
  createEntityAdapter<NormalizedDailySnapshot>({
    selectId: (entry) => entry.id.toLowerCase(),
  });

const SECONDS_PER_DAY = 24 * 60 * 60;
const SECONDS_PER_WEEK = SECONDS_PER_DAY * 7;

const selectors = dailySnapshotsAdapter.getSelectors(
  (state: AppState) => state.dailySnapshots
);

export const dailySnapshotsSelectors = {
  selectSortedSnapshotsOfPool: (
    state: AppState,
    poolId: string,
    direction: 'asc' | 'desc' = 'asc'
  ) => {
    const snapshots = selectors
      .selectAll(state)
      .filter((dailySnapshot) => dailySnapshot.id.includes(poolId));

    return [...snapshots].sort((left, right) =>
      direction === 'asc' ? left.date - right.date : right.date - left.date
    );
  },
  selectSortedSnapshotsOfPoolInTimeframe: (
    state: AppState,
    poolId: string,
    maxAgeInSeconds: number
  ) => {
    const snapshots = dailySnapshotsSelectors.selectSortedSnapshotsOfPool(
      state,
      poolId,
      'asc'
    );
    const unixNow = Date.now() / 1000;

    return [...snapshots].filter(
      (snapshot) => unixNow - snapshot.date <= maxAgeInSeconds
    );
  },
  selectTimeSeriesSnapshotData: <K extends keyof DailyPoolSnapshot>(
    state: AppState,
    poolId: string,
    timeframe: Timeframe,
    key: K
  ): { time: number; value: DailyPoolSnapshot[K] }[] => {
    const oneDay = 86400;
    const maxAgeLookup: Record<Timeframe, number> = {
      '1D': oneDay,
      '1W': oneDay * 7,
      '2W': oneDay * 14,
      '1M': oneDay * 30,
      '3M': oneDay * 90,
      '6M': oneDay * 180,
      '1Y': oneDay * 365,
    };
    const maxAgeInSeconds = maxAgeLookup[timeframe];

    const nonEmptySnapshotData = () => {
      let timeframe = maxAgeInSeconds;
      let snapshots =
        dailySnapshotsSelectors.selectSortedSnapshotsOfPoolInTimeframe(
          state,
          poolId,
          timeframe
        );

      while (snapshots.length < 3) {
        timeframe += oneDay;
        snapshots =
          dailySnapshotsSelectors.selectSortedSnapshotsOfPoolInTimeframe(
            state,
            poolId,
            timeframe
          );
      }

      return snapshots;
    };

    const timeSeriesData = nonEmptySnapshotData().map((snapshot) => ({
      time: snapshot.date,
      value: snapshot[key],
    }));

    return timeSeriesData;
  },
  selectMostRecentSnapshotOfPool: (state: AppState, poolId: string) => {
    const snapshots = dailySnapshotsSelectors.selectSortedSnapshotsOfPool(
      state,
      poolId,
      'desc'
    );
    const mostRecent = snapshots[0];
    return mostRecent;
  },
  selectSnapshotPeriodsForPool: (state: AppState, poolId: string) => {
    const allSnapshots =
      dailySnapshotsSelectors.selectSortedSnapshotsOfPoolInTimeframe(
        state,
        poolId,
        86400 // one day
      );
    const mostRecentSnapshot =
      dailySnapshotsSelectors.selectMostRecentSnapshotOfPool(state, poolId);
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
    const mostRecentSnapshot =
      dailySnapshotsSelectors.selectMostRecentSnapshotOfPool(state, poolId);
    const { last24Hours, lastWeek } =
      dailySnapshotsSelectors.selectSnapshotPeriodsForPool(state, poolId);

    if (mostRecentSnapshot?.totalVolumeUSD && last24Hours[0]?.totalVolumeUSD) {
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
        mostRecentSnapshot.totalValueLockedUSD -
        lastWeek[0].totalValueLockedUSD;

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
    }
  },
  selectPoolStats: (state: AppState, poolId: string) => {
    const mostRecentSnapshot =
      dailySnapshotsSelectors.selectMostRecentSnapshotOfPool(state, poolId);

    if (mostRecentSnapshot) {
      const deltas = dailySnapshotsSelectors.selectPoolDeltas(state, poolId);

      return {
        marketCap: parseFloat(mostRecentSnapshot.totalValueLockedUSD),
        price: parseFloat(mostRecentSnapshot.value),
        deltas,
        supply: parseFloat(mostRecentSnapshot.totalSupply),
      };
    }
  },
};

export type Timeframe = '1D' | '1W' | '2W' | '1M' | '3M' | '6M' | '1Y';
