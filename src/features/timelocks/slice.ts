import * as requests from "./requests";
import { Amount, TimeLockData } from "./types"
import { DNDX_ADDRESS, DNDX_TIMELOCK_ADDRESS } from "config";
import { convert, createMulticallDataParser } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchMulticallData } from "../batcher";
import { restartedDueToError } from "../actions";
import type { AppState } from "../store";


export const TIMELOCKS_CALLER = "Timelocks";

const adapter = createEntityAdapter<TimeLockData>({
  selectId: (entry) => entry?.id.toLowerCase() ?? "",
});

const slice = createSlice({
  name: "timelocks",
  initialState: adapter.getInitialState({
    metadata: {},
    withdrawn: "0",
    withdrawable: "0",
  }),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        const relevantMulticallData = timelocksMulticallDataParser(
          action.payload
        );

        if (relevantMulticallData) {
          const { withdrawable, withdrawn, timelocks } = relevantMulticallData;
          if (withdrawn !== undefined) state.withdrawn = withdrawn;
          if (withdrawable !== undefined) state.withdrawable = withdrawable;

          adapter.upsertMany(state, timelocks);
        }
      })
      .addCase(restartedDueToError, () =>
        adapter.getInitialState({
          metadata: {},
          dndx: "0",
          withdrawn: "0",
          withdrawable: "0",
        })
      )
      .addCase(requests.fetchTimelocksMetadata.fulfilled, (state, action) => {
        state.metadata = action.payload as any;
      })
      .addCase(requests.fetchTimelockData.fulfilled, (state, action) => {
        if (action.payload) {
          adapter.upsertOne(state, action.payload);
        }
      })
      .addCase(requests.fetchUserTimelocks.fulfilled, (state, action) => {
        if (action.payload) adapter.upsertMany(state, action.payload);
      }),
});

export const { actions: timelocksActions, reducer: timelocksReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.timelocks);

export const timelocksSelectors = {
  selectUserTimelocks: selectors.selectAll,
  selectUserTimelock: (state: AppState, id: string) =>
    selectors.selectById(state, id),
  selectDividendData: (state: AppState) => {
    const { withdrawn, withdrawable } = state.timelocks;

    return {
      withdrawn: convert.toBalance(withdrawn),
      withdrawable: convert.toBalance(withdrawable),
    };
  },
};

// #region Helpers
const timelocksMulticallDataParser = createMulticallDataParser(
  TIMELOCKS_CALLER,
  (calls) => {
    // const [locksCall, dndxCalls] = calls;
    const locksCall = calls.find(
      (call) => call[0].toLowerCase() === DNDX_TIMELOCK_ADDRESS[1].toLowerCase()
    );
    const dndxCalls = calls.find(
      (call) => call[0].toLowerCase() === DNDX_ADDRESS[1].toLowerCase()
    );

    // console.log(`GOT TIMELOCK RESULTS`)
    // console.log(locksCall)
    let formattedLocks: TimeLockData[] = [];
    if (locksCall) {
      const [, { locks }] = locksCall;
      formattedLocks = locks
        .map((lock) => {
          const [id] = lock.args ?? [];
          const [ndxAmount, createdAt, duration, owner] = lock.result ?? [];
          if (!id || !ndxAmount) return undefined;

          return {
            id,
            owner,
            ndxAmount: ndxAmount.toString(),
            createdAt: parseInt(createdAt),
            duration: parseInt(duration),
            dndxShares: "0", // Doesn't get used.
          };
        })
        .filter((t) => Boolean(t)) as TimeLockData[];
    }
    let withdrawable: string | undefined;
    let withdrawn: string | undefined;
    if (dndxCalls) {
      const [, { withdrawableDividendsOf, withdrawnDividendsOf }] = dndxCalls;
      withdrawable = withdrawableDividendsOf[0].result?.[0] ?? "0";
      withdrawn = withdrawnDividendsOf[0].result?.[0] ?? "0";
    }

    return {
      withdrawable,
      withdrawn,
      timelocks: formattedLocks,
    };
  }
);

// #endregion
