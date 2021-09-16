import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchMulticallData } from "features/batcher";
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

export const DNDX_CALLER = "dNDX";

const adapter = createEntityAdapter<DividendsLock>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const slice = createSlice({
  name: "dndx",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        return state;
      })
      .addCase(restartedDueToError, () => adapter.getInitialState()),
});

export const { actions: dndxActions, reducer: dndxReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.dndx);

export const dndxSelectors = {};
