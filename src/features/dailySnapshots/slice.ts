import { DailyPoolSnapshot } from "indexed-types";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchIndexPoolUpdates } from "../indexPools/requests";
import { fetchInitialData } from "../requests";
import { mirroredServerState, restartedDueToError } from "../actions";
import type { NormalizedDailySnapshot } from "./types";

export const dailySnapshotsAdapter =
  createEntityAdapter<NormalizedDailySnapshot>({
    selectId: (entry) => entry.id.toLowerCase(),
  });

const slice = createSlice({
  name: "dailySnapshots",
  initialState: dailySnapshotsAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        if (action.payload) {
          const { dailySnapshots } = action.payload;
          const fullSnapshots = dailySnapshots.ids.map(
            (id) => dailySnapshots.entities[id]
          );

          dailySnapshotsAdapter.addMany(state, fullSnapshots);
        }
      })
      .addCase(fetchIndexPoolUpdates.fulfilled, (state, action) => {
        const dailySnapshots = Object.values(action.payload)
          .filter((each) => Boolean(each))
          .reduce(
            (prev, { dailySnapshots }) => [...prev, ...dailySnapshots],
            [] as DailyPoolSnapshot[]
          );
        dailySnapshotsAdapter.addMany(state, dailySnapshots);
      })
      .addCase(
        mirroredServerState,
        (_, action) => action.payload.dailySnapshots
      )
      .addCase(restartedDueToError, () =>
        dailySnapshotsAdapter.getInitialState()
      ),
});

export const {
  actions: dailySnapshotsActions,
  reducer: dailySnapshotsReducer,
} = slice;
