import {
  PayloadAction,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import type { NdxStakingPool } from "indexed-types";

const adapter = createEntityAdapter<NdxStakingPool>();

const slice = createSlice({
  name: "staking",
  initialState: adapter.getInitialState(),
  reducers: {
    stakingDataLoaded(state, action: PayloadAction<NdxStakingPool[]>) {
      adapter.addMany(state, action.payload);
    },
  },
});

export const { actions } = slice;

export const selectors = {};

export default slice.reducer;
