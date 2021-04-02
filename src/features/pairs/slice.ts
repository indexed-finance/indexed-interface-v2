import {
  computeUniswapPairAddress,
  convert,
  createMulticallDataParser,
} from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchMulticallData } from "../requests";
import {
  mirroredServerState,
  restartedDueToError,
  uniswapPairsRegistered,
} from "../actions";
import { tokensSelectors } from "../tokens";
import type { AppState } from "../store";
import type { FormattedPair } from "../selectors";
import type { NormalizedPair, NormalizedToken } from "ethereum";

export const PAIR_DATA_CALLER = "Pair Data";

const adapter = createEntityAdapter<NormalizedPair>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const pairsInitialState = adapter.getInitialState();

const slice = createSlice({
  name: "pairs",
  initialState: pairsInitialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        const relevantMulticallData = pairMulticallDataParser(action.payload);

        if (relevantMulticallData) {
          for (const [
            pairAddress,
            { exists, reserves0, reserves1 },
          ] of Object.entries(relevantMulticallData)) {
            const id = pairAddress.toLowerCase();

            if (!state.entities[id]) {
              state.ids.push(id);
              state.entities[id] = { id };
            }

            const entity = state.entities[id]!;

            entity.exists = exists;
            entity.reserves0 = reserves0;
            entity.reserves1 = reserves1;
          }
        }
      })
      .addCase(uniswapPairsRegistered, (state, action) => {
        const formatted = action.payload.map(
          ({ id, token0 = "", token1 = "", ...rest }) => ({
            ...rest,
            id: id.toLowerCase(),
            token0: token0.toLowerCase(),
            token1: token1.toLowerCase(),
          })
        );

        adapter.upsertMany(state, formatted);
      })
      .addCase(mirroredServerState, (_, action) => {
        const { pairs } = action.payload;

        return pairs;
      })
      .addCase(restartedDueToError, () => pairsInitialState),
});

export const { actions: pairsActions, reducer: pairsReducer } = slice;

export const pairsSelectors = {
  ...adapter.getSelectors((state: AppState) => state.pairs),
  selectPairs: (state: AppState) => state.pairs,
  selectPairsById: (
    state: AppState,
    ids: string[]
  ): (NormalizedPair | undefined)[] => {
    const allPairs = pairsSelectors.selectPairs(state);
    return ids.reduce(
      (prev, next) => [...prev, allPairs.entities[next.toLowerCase()]],
      [] as (NormalizedPair | undefined)[]
    );
  },
  selectFormattedPairsById: (
    state: AppState,
    ids: string[]
  ): (FormattedPair | undefined)[] => {
    const allPairs = pairsSelectors.selectPairsById(state, ids);
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
    pairsSelectors.selectAll(state).filter((pair) => pair.exists !== undefined),
  selectTokenPair: (state: AppState, tokenA: string, tokenB: string) => {
    const pairAddress = computeUniswapPairAddress(tokenA, tokenB);
    return pairsSelectors.selectById(state, pairAddress.toLowerCase());
  },
};

// #region Helpers
const pairMulticallDataParser = createMulticallDataParser(
  PAIR_DATA_CALLER,
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
