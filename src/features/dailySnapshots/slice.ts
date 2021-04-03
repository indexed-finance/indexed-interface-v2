import { DailyPoolSnapshot } from "indexed-types";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchInitialData } from "../requests";
import { mirroredServerState, restartedDueToError } from "../actions";

export type SnapshotKey = keyof Omit<DailyPoolSnapshot, "date">;

export const dailySnapshotsAdapter = createEntityAdapter<DailyPoolSnapshot>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const initialState = dailySnapshotsAdapter.getInitialState();

const slice = createSlice({
  name: "dailySnapshots",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        const { dailySnapshots } = action.payload;
        const fullSnapshots = dailySnapshots.ids.map(
          (id) => dailySnapshots.entities[id]
        );

        dailySnapshotsAdapter.addMany(state, fullSnapshots);
      })
      .addCase(
        mirroredServerState,
        (_, action) => action.payload.dailySnapshots
      )
      .addCase(restartedDueToError, () => initialState),
});

export const {
  actions: dailySnapshotsActions,
  reducer: dailySnapshotsReducer,
} = slice;
