import { computeUniswapPairAddress } from "ethereum/utils/uniswap";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { tokensSelectors } from "features/tokens";
import { uniswapPairsRegistered, uniswapPairsUpdated } from "features/actions";
import type { AppState } from "features/store";
import type { FormattedPair } from "features/selectors";
import type { NormalizedPair, NormalizedToken } from "ethereum/types";

const adapter = createEntityAdapter<NormalizedPair>();

const slice = createSlice({
  name: "pairs",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(uniswapPairsUpdated, (state, action) => {
        for (const pair of action.payload) {
          const id = pair.id.toLowerCase();
          const pairInState = state.entities[id] as NormalizedPair;
          const { exists, reserves0, reserves1 } = pair;
          state.entities[id] = {
            ...pairInState,
            exists,
            reserves0,
            reserves1,
          };
        }
      })
      .addCase(uniswapPairsRegistered, (state, action) => {
        for (const pair of action.payload) {
          const id = pair.id.toLowerCase();
          if (!state.ids.includes(id)) {
            state.ids.push(id);
            state.entities[id] = { ...pair };
          }
        }
      }),
});

export const { actions } = slice;

export const selectors = {
  ...adapter.getSelectors((state: AppState) => state.pairs),
  selectPairs: (state: AppState) => state.pairs,
  selectPairsById: (
    state: AppState,
    ids: string[]
  ): (NormalizedPair | undefined)[] => {
    const allPairs = selectors.selectPairs(state);
    return ids.reduce(
      (prev, next) => [...prev, allPairs.entities[next.toLowerCase()]],
      [] as (NormalizedPair | undefined)[]
    );
  },
  selectFormattedPairsById: (
    state: AppState,
    ids: string[]
  ): (FormattedPair | undefined)[] => {
    const allPairs = selectors.selectPairsById(state, ids);
    const allTokens = tokensSelectors.selectEntities(state);
    const formattedPairs: (FormattedPair | undefined)[] = [];
    for (const pair of allPairs) {
      let formattedPair: FormattedPair | undefined;
      if (pair && pair.exists !== undefined && pair.token0 && pair.token1) {
        const token0 = allTokens[pair.token0.toLowerCase()] as NormalizedToken;
        const token1 = allTokens[pair.token1.toLowerCase()] as NormalizedToken;
        formattedPair = {
          id: pair.id,
          exists: pair.exists,
          token0,
          token1,
          reserves0: pair.reserves0 as string,
          reserves1: pair.reserves1 as string,
        };
      }
      formattedPairs.push(formattedPair);
    }
    return formattedPairs;
  },
  selectAllUpdatedPairs: (state: AppState) => {
    const allPairs = selectors.selectAll(state);
    return allPairs.filter((pair) => pair.exists !== undefined);
  },
  selectTokenPair: (state: AppState, tokenA: string, tokenB: string) => {
    const pairAddress = computeUniswapPairAddress(tokenA, tokenB);
    return selectors.selectById(state, pairAddress.toLowerCase());
  },
};

export default slice.reducer;
