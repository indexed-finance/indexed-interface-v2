import { NirnVaultData } from "./types";
import { convert, createMulticallDataParser } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchMulticallData } from "../batcher/requests"; // Circular dependency.
import { mirroredServerState, restartedDueToError } from "../actions";
import type { AppState } from "../store";

export const VAULTS_CALLER = "Vaults";

const adapter = createEntityAdapter<NirnVaultData>({
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
        } else {
          adapter.upsertMany(state, [
            {
              id: "0x6b175474e89094c44da98b954eedeac495271d0f",
              symbol: "FAKE",
              name: "Fake Vault",
              underlying: "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
              adapters: [
                {
                  id: "0x6b175474e89094c44da98b954eedeac495271d0f",
                  underlying: "0x6b175474e89094c44da98b954eedeac495271d0f",
                  token: "0x6b175474e89094c44da98b954eedeac495271d0f",
                  name: "Compound FAKE Adapter",
                  apr: 0.05,
                  protocolID: "compound",
                },
                {
                  id: "0x6b175474e89094c44da98b954eedeac495271d0f",
                  underlying: "0x6b175474e89094c44da98b954eedeac495271d0f",
                  token: "0x6b175474e89094c44da98b954eedeac495271d0f",
                  name: "AAVE FAKE Adapter",
                  apr: 0.05,
                  protocolID: "aave",
                },
              ],
              weights: ["5e17", "5e17"],
              balances: ["0"],
              netAPR: 0.05,
              performanceFee: 0.1,
              pricePerShare: convert.toToken("200").toString(),
            },
          ] as NirnVaultData[]);
        }
      })
      .addCase(mirroredServerState, (_, action) => action.payload.vaults)
      .addCase(restartedDueToError, () => adapter.getInitialState()),
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

// #region Helpers
const vaultsMulticallDataParser = createMulticallDataParser(
  VAULTS_CALLER,
  (calls) => {
    // TODO: Fill me.
  }
);
