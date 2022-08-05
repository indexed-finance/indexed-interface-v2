import { NATIVE_TOKEN } from "config";
import {
  PayloadAction,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import {
  changedNetwork,
  mirroredServerState,
  restartedDueToError,
} from "../actions";
import { constants } from "ethers"; // Circular dependency.
import { createMulticallDataParser } from "helpers";
import { fetchInitialData } from "../requests";
import { fetchMulticallData } from "../batcher/requests";
import { fetchTokenPriceData } from "./requests";
import { pairsActions } from "../pairs";
import type { NormalizedToken } from "./types";

export const tokensAdapter = createEntityAdapter<NormalizedToken>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const slice = createSlice({
  name: "tokens",
  initialState: tokensAdapter.getInitialState(),
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
              if (result) entry.totalSupply = result;
            }
          }
        }

        return state;
      })
      .addCase(changedNetwork, (state, action) => {
        const nativeToken = NATIVE_TOKEN[action.payload];
        const fullNativeToken = {
          id: constants.AddressZero,
          decimals: 18,
          priceData: undefined,
          chainId: action.payload,
          ...nativeToken,
        };
        tokensAdapter.upsertOne(state, fullNativeToken);
      })
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        if (action.payload) {
          const { tokens } = action.payload;
          const fullTokens = tokens.ids.map((id) => tokens.entities[id]);
          for (const token of fullTokens) {
            if (typeof token.decimals === "string") {
              token.decimals = +token.decimals;
            }
          }

          tokensAdapter.upsertMany(state, fullTokens);
        }
      })
      .addCase(fetchTokenPriceData.fulfilled, (state, action) => {
        if (action.payload) {
          for (const [address, value] of Object.entries(action.payload)) {
            if (value) {
              const { price, change24Hours, percentChange24Hours } = value;
              const entry = state.entities[address.toLowerCase()];

              if (entry) {
                state.entities[address.toLowerCase()]!.priceData = {
                  price,
                  change24Hours,
                  percentChange24Hours,
                };
              }
            } else {
              // TODO: Put data here anyway when waiting for data to come in.
            }
          }
        }
      })
      .addCase(pairsActions.uniswapPairsRegistered, (state, action) => {
        const { pairs, chainId } = action.payload;
        for (const pair of pairs) {
          if (!state.entities[pair.id.toLowerCase()]) {
            let t0 = pair.token0
              ? state.entities[pair.token0.toLowerCase()]?.symbol
              : "";
            if (t0 === "WETH") t0 = "ETH";
            let t1 = pair.token1
              ? state.entities[pair.token1.toLowerCase()]?.symbol
              : "";
            if (t1 === "WETH") t1 = "ETH";
            if (
              pair.id.toLowerCase() ===
              "0x8911fce375a8414b1b578be66ee691a8d2d4dbf7"
            ) {
              t0 = "NDX";
              t1 = "ETH";
            }
            const [symbolPrefix, namePrefix] = pair.sushiswap
              ? ["SUSHI", "Sushiswap"]
              : ["UNIV2", "UniswapV2"];
            const [symbol, name] =
              t0 && t1
                ? [`${t0}-${t1}`, `${namePrefix}:${t0}-${t1}`]
                : [symbolPrefix, `${namePrefix} LP Token`];
            state.ids.push(pair.id.toLowerCase());
            state.entities[pair.id.toLowerCase()] = {
              id: pair.id.toLowerCase(),
              symbol,
              name,
              decimals: 18,
              chainId,
            };
          }
        }
      })
      .addCase(mirroredServerState, (state, action) => {
        // action.payload.tokens
        for (const id of action.payload.tokens.ids) {
          const token: NormalizedToken = action.payload.tokens.entities[id];
          const entry = state.entities[id.toLowerCase()];
          if (entry) {
            if (token.priceData) {
              entry.priceData = {
                ...(entry.priceData || {}),
                ...token.priceData,
              };
            }

            if (token.totalSupply) {
              entry.totalSupply = token.totalSupply;
            }
          } else {
            tokensAdapter.addOne(state, token);
          }
        }
      })
      .addCase(restartedDueToError, () => tokensAdapter.getInitialState()),
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
