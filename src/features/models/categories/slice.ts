import { NormalizedCategory } from "ethereum";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { subgraphDataLoaded } from "features/actions";
import type { AppState } from "features/store";

const adapter = createEntityAdapter<NormalizedCategory>();

const slice = createSlice({
  name: "categories",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder.addCase(subgraphDataLoaded, (state, action) => {
      const { categories } = action.payload;
      const fullCategories = categories.ids.map(
        (id) => categories.entities[id]
      );

      adapter.addMany(state, fullCategories);
    }),
});

export const { actions } = slice;

export const selectors = {
  ...adapter.getSelectors((state: AppState) => state.categories),
  selectAllCategories: (state: AppState) => selectors.selectAll(state),
};

export default slice.reducer;
