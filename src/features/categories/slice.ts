import { NormalizedCategory } from "ethereum";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { mirroredServerState, subgraphDataLoaded } from "features/actions";
import S from "string";
import SigmaTenExOne from "./local-data/sigma-v10x1.json";
import ZeroExOne from "./local-data/0x1.json";
import ZeroExThree from "./local-data/0x3.json";
import ZeroExTwo from "./local-data/0x2.json";
import type { AppState } from "features/store";

// #region Local Data Initialization
// --
const LOCAL_DATA_LOOKUP: Record<string, typeof ZeroExOne> = {
  "0x1": ZeroExOne,
  "0x2": ZeroExTwo,
  "0x3": ZeroExThree,
  "sigma-v10x1": SigmaTenExOne,
};

const adapter = createEntityAdapter<NormalizedCategory>();
const initialState = adapter.getInitialState();
const withLocalData = adapter.addMany(
  initialState,
  Object.values(LOCAL_DATA_LOOKUP)
);
// #endregion

const slice = createSlice({
  name: "categories",
  initialState: withLocalData,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(subgraphDataLoaded, (state, action) => {
        const { categories } = action.payload;
        const mapped = selectors
          .selectAll({ categories: state } as AppState)
          .map((existing) => ({
            ...existing,
            ...categories.entities[existing.id],
          }));

        adapter.upsertMany(state, mapped);
      })
      .addCase(mirroredServerState, (_, action) => {
        const { categories } = action.payload;

        return categories;
      }),
});

export const { actions } = slice;

export const selectors = {
  ...adapter.getSelectors((state: AppState) => state.categories),
  selectCategory: (state: AppState, categoryId: string) =>
    selectors.selectById(state, categoryId),
  selectCategoryLookup: (state: AppState) => selectors.selectEntities(state),
  selectAllCategories: (state: AppState) => selectors.selectAll(state),
  selectCategoryByName: (state: AppState, name: string) => {
    const formatName = (from: string) => S(from).camelize().s.toLowerCase();
    const formattedName = formatName(name);
    const categories = selectors
      .selectAllCategories(state)
      .reduce((prev, next) => {
        prev[formatName(next.name)] = next;
        return prev;
      }, {} as Record<string, NormalizedCategory>);

    return categories[formattedName] ?? null;
  },
};

export default slice.reducer;
