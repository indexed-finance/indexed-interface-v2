import { COMMON_BASE_TOKENS } from "config";
import {
  PayloadAction,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { createMulticallDataParser } from "helpers";
import { fetchMulticallData } from "../requests";
import {
  mirroredServerState,
  restartedDueToError,
  subgraphDataLoaded,
  tokenStatsDataLoaded,
  tokenStatsRequestFailed,
  uniswapPairsRegistered,
} from "../actions";
import type { NormalizedToken } from "ethereum";

export const tokensAdapter = createEntityAdapter<NormalizedToken>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const tokensInitialState = tokensAdapter.getInitialState({
  lastTokenStatsError: -1,
});

const slice = createSlice({
  name: "tokens",
  initialState: tokensInitialState,
  reducers: {
    totalSuppliesUpdated(
      state,
      action: PayloadAction<Array<{ token: string; totalSupply: string }>>
    ) {
      for (const { token, totalSupply } of action.payload) {
        const entity = state.entities[token.toLowerCase()];
        if (entity) {
          entity.totalSupply = totalSupply;
        }
      }
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        const relevantMulticallData = totalSuppliesMulticallDataParser(
          action.payload
        );

        if (relevantMulticallData) {
          for (const [tokenAddress, result] of Object.entries(
            relevantMulticallData
          )) {
            const entry = state.entities[tokenAddress];

            if (entry) {
              entry.totalSupply = result;
            }
          }
        }

        return state;
      })
      .addCase(subgraphDataLoaded, (state, action) => {
        const { tokens } = action.payload;
        const fullTokens = tokens.ids.map((id) => tokens.entities[id]);

        for (const commonToken of COMMON_BASE_TOKENS) {
          if (!tokens.entities[commonToken.id]) {
            fullTokens.push({ ...commonToken, coingeckoId: "" });
          }
        }

        tokensAdapter.addMany(state, fullTokens);
      })
      .addCase(tokenStatsDataLoaded, (state, action) => {
        if (action.payload) {
          state.lastTokenStatsError = -1;

          for (const [address, value] of Object.entries(action.payload)) {
            if (value) {
              const { price, change24Hours, percentChange24Hours } = value;
              const entry = state.entities[address.toLowerCase()];

              if (entry) {
                entry.priceData = {
                  price,
                  change24Hours,
                  percentChange24Hours,
                };
              }
            }
          }
        }
      })
      .addCase(tokenStatsRequestFailed, (state, action) => {
        state.lastTokenStatsError = action.payload.when;
      })
      .addCase(mirroredServerState, (_, action) => {
        const { tokens } = action.payload;

        return tokens;
      })
      .addCase(restartedDueToError, () => tokensInitialState)
      .addCase(uniswapPairsRegistered, (state, action) => {
        for (const pair of action.payload) {
          if (!state.entities[pair.id.toLowerCase()]) {
            state.ids.push(pair.id.toLowerCase());
            state.entities[pair.id.toLowerCase()] = {
              id: pair.id.toLowerCase(),
              symbol: "UniV2",
              name: `UniswapV2 LP Token`,
              decimals: 18,
              coingeckoId: "",
            };
          }
        }
      }),
});

export const { actions: tokensActions, reducer: tokensReducer } = slice;

// #region Helpers
const totalSuppliesMulticallDataParser = createMulticallDataParser(
  "Total Supplies",
  (calls) => {
    const formattedTotalSupplies = calls.reduce((prev, next) => {
      const [tokenAddress, functions] = next;
      const totalSupplies = functions.totalSupply;

      for (const totalSupply of totalSupplies) {
        if (totalSupply.result) {
          prev[tokenAddress] = totalSupply.result[0];
        }
      }

      return prev;
    }, {} as Record<string, string>);

    return formattedTotalSupplies;
  }
);
// #endregion
