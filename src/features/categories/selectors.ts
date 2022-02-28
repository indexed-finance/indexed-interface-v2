import { createEntityAdapter } from "@reduxjs/toolkit";
import S from "string";
import type { AppState } from "../store";
import type { NormalizedCategory } from "./types";

export const categoriesAdapter = createEntityAdapter<NormalizedCategory>({
  selectId: (entry) => entry.id.toLowerCase(),
});
const selectors = categoriesAdapter.getSelectors((state: AppState) => state.categories);

export const categoriesSelectors = {
  ...selectors,
  selectCategory: (state: AppState, categoryId: string) =>
    selectors.selectById(state, categoryId),
  selectCategoryLookup: (state: AppState) => selectors.selectEntities(state),
  selectAllCategories: (state: AppState) => selectors.selectAll(state),
  selectCategoryByName: (state: AppState, name: string) => {
    const formatName = (from: string) => S(from).camelize().s.toLowerCase();
    const formattedName = formatName(name);
    const categories = categoriesSelectors
      .selectAllCategories(state)
      .reduce((prev, next) => {
        prev[formatName(next.name)] = next;
        return prev;
      }, {} as Record<string, NormalizedCategory>);

    return categories[formattedName] ?? null;
  },
};
