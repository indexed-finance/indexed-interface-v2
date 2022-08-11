import { DailyPoolSnapshot } from "indexed-types";
import { createSlice } from "@reduxjs/toolkit";
import { dailySnapshotsAdapter } from "./selectors"
import { fetchIndexPoolUpdates } from "../indexPools/requests";
import { fetchInitialData } from "../requests";
import { fetchSnapshotsData } from "./requests";
import { mirroredServerState, restartedDueToError } from "../actions";


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
            (prev, { snapshot }) => [...prev, snapshot as any],
            /** replace state types with types from subgraph client package */
            [] as DailyPoolSnapshot[]
          );
        dailySnapshotsAdapter.addMany(state, dailySnapshots);
      })
      .addCase(fetchSnapshotsData.fulfilled, (state, action) => {
        const dailySnapshots = action.payload;

        dailySnapshotsAdapter.upsertMany(state, dailySnapshots as any);
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
