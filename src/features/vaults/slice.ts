import {
  TokenAdapter,
  TokenData,
  VaultData,
  VaultSnapshot,
} from "@indexed-finance/subgraph-clients/dist/nirn/types";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { createMulticallDataParser } from "helpers";
import { fetchMulticallData } from "../batcher/requests"; // Circular dependency.
import { fetchVaultsData } from "./requests";
import { mirroredServerState, restartedDueToError } from "../actions";
import type { AppState } from "../store";

export interface FormattedVault {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  totalFeesClaimed: string;
  underlying: TokenData;
  feeRecipient: string;
  rewardsSeller: string;
  performanceFee: number;
  reserveRatio: number;
  adapters: TokenAdapter[];
  weights: number[];
  snapshots: VaultSnapshot[];
}

export const VAULTS_CALLER = "Vaults";

const adapter = createEntityAdapter<VaultData>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const slice = createSlice({
  name: "vaults",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        const relevantMulticallData = vaultsMulticallDataParser(action.payload);

        if (relevantMulticallData) {
          // TODO: Fill me.

          console.log({ relevantMulticallData });
        }
      })
      .addCase(mirroredServerState, (_, action) => action.payload.vaults)
      .addCase(restartedDueToError, () => adapter.getInitialState())
      .addCase(fetchVaultsData.fulfilled, (state, action) => {
        const vaults = action.payload ?? [];

        adapter.upsertMany(state, vaults);
      }),
});

export const { actions: vaultsActions, reducer: vaultsReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.vaults);

export const vaultsSelectors = {
  selectAllVaults(state: AppState) {
    return selectors.selectAll(state);
  },
  selectVault(state: AppState, id: string) {
    const vault = selectors.selectById(state, id);

    return vault ?? null;
  },
};

// #region Helpers
const vaultsMulticallDataParser = createMulticallDataParser(
  VAULTS_CALLER,
  (calls) => {
    console.log({ calls });

    // TODO: Fill me.
  }
);
