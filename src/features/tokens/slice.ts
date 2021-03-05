import { DEFAULT_DECIMAL_COUNT } from "config";
import { NormalizedToken } from "ethereum";
import { PoolUnderlyingToken } from "indexed-types";
import {
  coingeckoDataLoaded,
  coingeckoIdsLoaded,
  poolUpdated,
  receivedInitialStateFromServer,
  receivedStatePatchFromServer,
  subgraphDataLoaded,
} from "features/actions";
import { convert } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { AppState } from "features/store";

const adapter = createEntityAdapter<NormalizedToken>();

const slice = createSlice({
  name: "tokens",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(subgraphDataLoaded, (state, action) => {
        const { tokens } = action.payload;
        const fullTokens = tokens.ids.map((id) => tokens.entities[id]);

        adapter.addMany(state, fullTokens);
      })
      .addCase(coingeckoIdsLoaded, (state, action) => {
        const symbolToIdLookup = action.payload.reduce((prev, next) => {
          prev[next.symbol.toLowerCase()] = next.id;
          return prev;
        }, {} as Record<string, string>);

        for (const id of state.ids) {
          const token = state.entities[id];

          if (token) {
            token.coingeckoId = symbolToIdLookup[token.symbol];
          }
        }
      })
      .addCase(coingeckoDataLoaded, (state, action) => {
        for (const [
          address,
          { price, change24Hours, percentChange24Hours },
        ] of Object.entries(action.payload)) {
          const entry = state.entities[address.toLowerCase()];

          if (entry) {
            entry.priceData = {
              price,
              change24Hours,
              percentChange24Hours,
            };
          }
        }
      })
      .addCase(poolUpdated, (state, action) => {
        const { pool, update } = action.payload;

        if (pool) {
          for (const tokenData of update.tokens) {
            const token = state.entities[tokenData.address];

            if (token) {
              token.dataFromPoolUpdates[pool.id] = tokenData;

              const tokenIndexPoolData = token.dataByIndexPool[pool.id];

              if (tokenIndexPoolData) {
                const denorm = convert.toBigNumber(tokenIndexPoolData.denorm);
                const totalWeight = convert.toBigNumber(pool.totalWeight);
                const prescaled = denorm.dividedBy(totalWeight);
                const scalePower = convert.toBigNumber(
                  DEFAULT_DECIMAL_COUNT.toString()
                );
                const scaleMultiplier = convert
                  .toBigNumber("10")
                  .pow(scalePower);
                const weight = prescaled.multipliedBy(scaleMultiplier);

                token.dataFromPoolUpdates[pool.id]!.weight = weight.toString();
              }
            }
          }
        }
      })
      .addCase(receivedInitialStateFromServer, (_, action) => {
        const { tokens } = action.payload;

        return tokens;
      })
      .addCase(receivedStatePatchFromServer, (_, action) => {
        const { tokens } = action.payload;

        return tokens;
      }),
});

export const { actions } = slice;

export const selectors = {
  ...adapter.getSelectors((state: AppState) => state.tokens),
  selectTokens: (state: AppState) => state.tokens,
  selectAllTokens: (state: AppState) => selectors.selectAll(state),
  selectTokenLookup: (state: AppState) => selectors.selectEntities(state),
  selectTokenLookupBySymbol: (state: AppState) =>
    selectors.selectAllTokens(state).reduce((prev, next) => {
      prev[next.symbol.toLowerCase()] = next;
      return prev;
    }, {} as Record<string, NormalizedToken>),
  selectTokenSymbols: (state: AppState) =>
    selectors.selectAll(state).map(({ symbol }) => symbol),
  selectPoolUnderlyingTokens: (state: AppState, poolId: string) => {
    const tokens = selectors.selectAll(state);

    return tokens.reduce((prev, next) => {
      const poolData = next.dataByIndexPool[poolId];

      if (poolData) {
        prev.push(poolData);
      }

      return prev;
    }, [] as PoolUnderlyingToken[]);
  },
  selectTokenSymbol: (state: AppState, poolId: string) =>
    selectors.selectTokenLookup(state)[poolId]?.symbol ?? "",
  selectAppMenuTokens: (state: AppState) => {
    const tokens = selectors.selectAllTokens(state);

    return tokens.map((token) => {
      const categoryData = token.dataByCategory["0x1"] ?? {
        name: "",
      };

      return {
        id: token.id,
        name: categoryData.name,
      };
    });
  },
};

export default slice.reducer;