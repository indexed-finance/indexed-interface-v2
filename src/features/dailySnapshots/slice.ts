import { DailyPoolSnapshot } from "indexed-types";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import {
  mirroredServerState,
  restartedDueToError,
  subgraphDataLoaded,
} from "features/actions";

export type SnapshotKey = keyof Omit<DailyPoolSnapshot, "date">;

export const adapter = createEntityAdapter<DailyPoolSnapshot>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const initialState = adapter.getInitialState();

const slice = createSlice({
  name: "dailySnapshots",
  initialState,
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
      })
      .addCase(restartedDueToError, () => initialState),
});

export const { actions } = slice;

export default slice.reducer;
