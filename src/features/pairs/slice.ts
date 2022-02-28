import { NDX_ADDRESS, WETH_ADDRESS } from "config";
import {
  PayloadAction,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import {
  computeUniswapPairAddress,
  convert,
  createMulticallDataParser,
} from "helpers";
import { fetchMulticallData } from "../batcher/requests"; // Circular dependency.
import { mirroredServerState, restartedDueToError } from "../actions";
import type { AppState } from "../store";
import type { NormalizedPair } from "./types";

export const PAIR_DATA_CALLER = "Pair Data";

const adapter = createEntityAdapter<NormalizedPair>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const slice = createSlice({
  name: "pairs",
  initialState: adapter.getInitialState(),
  reducers: {
    uniswapPairsRegistered(state, action: PayloadAction<{ pairs: NormalizedPair[]; chainId: number; }>) {
      const filtered = action.payload.pairs.filter(
        ({ id }) => !state.entities[id.toLowerCase()]
      );
      const formatted = filtered.map(
        ({ id, token0 = "", token1 = "", ...rest }) => ({
          ...rest,
          id: id.toLowerCase(),
          token0: token0.toLowerCase(),
          token1: token1.toLowerCase(),
        })
      );

      adapter.upsertMany(state, formatted);
    },
  },
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
      .addCase(mirroredServerState, (state, action) => {
        for (const id of action.payload.pairs.ids) {
          const pair: NormalizedPair = action.payload.pairs.entities[id];
          const entry = state.entities[id.toLowerCase()];

          if (entry) {
            if (typeof pair.exists !== "undefined") {
              if (pair.exists && pair.reserves0 && pair.reserves1) {
                entry.exists = true;
                entry.reserves0 = pair.reserves0;
                entry.reserves1 = pair.reserves1;
              } else {
                entry.exists = false;
              }
            }
          } else {
            pair.id = pair.id.toLowerCase();
            adapter.addOne(state, pair);
          }
        }
      })
      .addCase(restartedDueToError, () => adapter.getInitialState()),
});

export const { actions: pairsActions, reducer: pairsReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.pairs);

export const pairsSelectors = {
  selectPairs: (state: AppState) => state.pairs,
  selectAllPairs: (state: AppState) => Object.values(state.pairs.entities),
  selectAllPairIds: (state: AppState) =>
    state.pairs.ids.map((id) => id.toString()),
  selectPairById: (state: AppState, id: string): NormalizedPair | undefined => {
    return state.pairs.entities[id.toLowerCase()];
  },
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
  selectAllUpdatedPairs: (state: AppState) =>
    selectors.selectAll(state).filter((pair) => pair.exists !== undefined),
  selectTokenPair: (state: AppState, tokenA: string, tokenB: string) => {
    const pairAddress = computeUniswapPairAddress(tokenA, tokenB, state.settings.network);
    return selectors.selectById(state, pairAddress.toLowerCase());
  },
  selectPairExistsLookup: (state: AppState, pairIds: string[]) => {
    const allPairs = pairsSelectors.selectPairsById(state, pairIds);
    return allPairs.reduce(
      (prev, next, i) => ({
        ...prev,
        [pairIds[i]]: next ? next.exists === true : false,
      }),
      {} as Record<string, boolean>
    );
  },
  selectNdxPrice(state: AppState, ethPrice: number) {
    const chainId = state.settings.network;
    const wethAddress = WETH_ADDRESS[chainId];
    const ndxAddress = NDX_ADDRESS[chainId];
    if (!ndxAddress) return 0;
    const wethNdxPair = computeUniswapPairAddress(
      wethAddress,
      ndxAddress,
      state.settings.network
    );
    const [pairData] = pairsSelectors.selectPairsById(state, [wethNdxPair]);

    if (pairData) {
      const { token0, reserves0, reserves1 } = pairData;

      if (token0 && reserves0 && reserves1) {
        const firstIsNdx = ndxAddress.toLowerCase() === token0.toLowerCase();
        const [firstValue, secondValue] = firstIsNdx
          ? [reserves1, reserves0]
          : [reserves0, reserves1];

        if (firstValue && secondValue) {
          const numberOfEth = convert
            .toBigNumber(firstValue)
            .dividedBy(convert.toBigNumber(secondValue))
            .toNumber();

          return numberOfEth * ethPrice;
        }
      }
    }

    return 0;
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
              convert.toBigNumber(value).isGreaterThan(0)
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
