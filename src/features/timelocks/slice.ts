import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchMulticallData } from "../batcher";
import { fetchTimelocksData } from "../requests";
import { restartedDueToError } from "../actions";
import type { AppState } from "../store";

export type Amount = {
  exactAsString: string;
  displayed: string;
};

export type DividendsLock = {
  id: string;
  owner: string;
  unlockAt: number;
  duration: number;
  amount: string;
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

const adapter = createEntityAdapter<DividendsLock>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const slice = createSlice({
  name: "timelocks",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        return state;
      })
      .addCase(restartedDueToError, () => adapter.getInitialState())
      .addCase(fetchTimelocksData.fulfilled, (state, action) => {
        const timelocks = action.payload ?? [];

        adapter.upsertMany(state, timelocks);
      }),
});

export const { actions: timelocksActions, reducer: timelocksReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.timelocks);

export const timelocksSelectors = {};

// Temporary
