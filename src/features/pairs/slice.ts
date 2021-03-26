import { computeUniswapPairAddress } from "ethereum/utils/uniswap";
import { convert, createMulticallDataParser } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import {
  multicallDataReceived,
  uniswapPairsRegistered,
} from "features/actions";
import { pairDataCaller } from "./hooks";
import { tokensSelectors } from "features/tokens";
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
      .addCase(multicallDataReceived, (state, action) => {
        const relevantMulticallData = pairMulticallDataParser(action.payload);

        if (relevantMulticallData) {
          for (const [
            pairAddress,
            { exists, reserves0, reserves1 },
          ] of Object.entries(relevantMulticallData)) {
            const id = pairAddress.toLowerCase();
            const pairInState = state.entities[id] as NormalizedPair;

            if (pairInState && exists) {
              pairInState.reserves0 = reserves0;
              pairInState.reserves1 = reserves1;
            }
          }
        }
      })
      .addCase(uniswapPairsRegistered, (state, action) => {
        adapter.addMany(state, action.payload);
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
  selectAllUpdatedPairs: (state: AppState) =>
    selectors.selectAll(state).filter((pair) => pair.exists !== undefined),
  selectTokenPair: (state: AppState, tokenA: string, tokenB: string) => {
    const pairAddress = computeUniswapPairAddress(tokenA, tokenB);
    return selectors.selectById(state, pairAddress.toLowerCase());
  },
};

export default slice.reducer;

// #region Helpers
const pairMulticallDataParser = createMulticallDataParser(
  pairDataCaller,
  (calls) => {
    const formattedPairData = calls.reduce(
      (prev, next) => {
        const [pairAddress, functions] = next;
        const pairs = functions.getReserves;

        for (const pair of pairs) {
          if (pair.result) {
            const [reserves0, reserves1] = pair.result;
            const exists = [reserves0, reserves1].every((value) =>
              convert.toBigNumber(value).isPositive()
            );

            prev[pairAddress] = {
              exists,
              reserves0,
              reserves1,
            };
          }
        }

        return prev;
      },
      {} as Record<
        string,
        {
          exists: boolean;
          reserves0: string;
          reserves1: string;
        }
      >
    );

    return formattedPairData;
  }
);
// #endregion
