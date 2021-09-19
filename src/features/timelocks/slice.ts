import * as requests from "./requests";
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
  selectId: (entry) => entry.id.toLowerCase(),
});

const slice = createSlice({
  name: "timelocks",
  initialState: adapter.getInitialState({
    metadata: {},
  }),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(restartedDueToError, () =>
        adapter.getInitialState({
          metadata: {},
        })
      )
      .addCase(requests.fetchTimelocksMetadata.fulfilled, (state, action) => {
        // const timelocks = action.payload ?? [];
        // adapter.upsertMany(state, timelocks);
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

export const timelocksSelectors = {};

// Temporary
