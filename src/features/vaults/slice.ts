import { NirnVaultData } from "./types";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { AppState } from "../store";

export const vaultsCaller = "Vaults";

const adapter = createEntityAdapter<NirnVaultData>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const slice = createSlice({
  name: "vaults",
  initialState: adapter.getInitialState(),
  reducers: {},
});

export const { actions: vaultsActions, reducer: vaultsReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.vaults);

export const vaultsSelectors = {
  selectAllVaults(state: AppState) {
    return selectors.selectAll(state);
  },
  selectVault(state: AppState, id: string) {
    return selectors.selectById(state, id);
  },
};
