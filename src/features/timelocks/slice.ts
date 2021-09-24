import * as requests from "./requests";
import { convert, createMulticallDataParser } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchMulticallData } from "../batcher";
import { restartedDueToError } from "../actions";
import type { AppState } from "../store";

export type Amount = {
  exactAsString: string;
  displayed: string;
};

export type TimeLockData = {
  id: string;
  owner: string;
  createdAt: number;
  ndxAmount: string;
  duration: number;
  dndxShares: string;
};

export type FormattedDividendsLock = {
  id: string;
  owner: string;
  unlockAt: number;
  duration: number;
  timeRemaining: number;
  unlocked: boolean;
  amount: Amount;
  dividends: Amount;
  available: Amount; // Amount of NDX that could be withdrawn now
};

export const TIMELOCKS_CALLER = "Timelocks";

const adapter = createEntityAdapter<TimeLockData>({
  selectId: (entry) => entry?.id.toLowerCase() ?? "",
});

const slice = createSlice({
  name: "timelocks",
  initialState: adapter.getInitialState({
    metadata: {},
    dndx: "0",
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
          const { dndxAmount, withdrawable, withdrawn, timelocks } =
            relevantMulticallData;

          state.dndx = dndxAmount;
          state.withdrawn = withdrawn;
          state.withdrawable = withdrawable;

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
        adapter.upsertMany(state, action.payload);
      }),
});

export const { actions: timelocksActions, reducer: timelocksReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.timelocks);

export const timelocksSelectors = {
  selectUserTimelocks: selectors.selectAll,
  selectDndxBalance: (state: AppState) =>
    convert.toBalance(state.timelocks.dndx, 18),
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
    try {
      const [locksCall, dndxCalls] = calls;
      const [, { locks }] = locksCall;
      const formattedLocks: TimeLockData[] = locks.map((lock) => {
        const [id] = lock.args ?? [];
        const [ndxAmount, createdAt, duration, owner] = lock.result ?? [];

        return {
          id,
          owner,
          ndxAmount,
          createdAt: parseInt(createdAt),
          duration: parseInt(duration),
          dndxShares: "0", // Doesn't get used.
        };
      });

      const [, { balanceOf, withdrawableDividendsOf, withdrawnDividendsOf }] =
        dndxCalls;
      const dndxAmount = balanceOf[0].result?.[0] ?? "0";
      const withdrawable = withdrawableDividendsOf[0].result?.[0] ?? "0";
      const withdrawn = withdrawnDividendsOf[0].result?.[0] ?? "0";

      return {
        dndxAmount,
        withdrawable,
        withdrawn,
        timelocks: formattedLocks,
      };
    } catch {
      return {
        dndxAmount: "0",
        withdrawable: "0",
        withdrawn: "0",
        timelocks: [],
      };
    }
  }
);

// #endregion
