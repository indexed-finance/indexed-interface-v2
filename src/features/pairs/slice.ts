import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
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
    uniswapPairsRegistered(state, action: PayloadAction<NormalizedPair[]>) {
      const formatted = action.payload.map(
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
      .addCase(mirroredServerState, (_, action) => action.payload.pairs)
      .addCase(restartedDueToError, () => adapter.getInitialState()),
});

export const { actions: pairsActions, reducer: pairsReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.pairs);

export const pairsSelectors = {
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
  selectAllUpdatedPairs: (state: AppState) =>
    selectors.selectAll(state).filter((pair) => pair.exists !== undefined),
  selectTokenPair: (state: AppState, tokenA: string, tokenB: string) => {
    const pairAddress = computeUniswapPairAddress(tokenA, tokenB);
    return selectors.selectById(state, pairAddress.toLowerCase());
  },
  selectPairExistsLookup: (state: AppState, pairIds: string[]) => {
    const allPairs = pairsSelectors.selectPairsById(state, pairIds);
    return allPairs.reduce((prev, next, i) => ({
      ...prev,
      [pairIds[i]]: next ? next.exists === true : false
    }), {} as Record<string, boolean>);
  },
  selectNdxPrice(state: AppState, ethPrice: number) {
    const wethNdxPair = computeUniswapPairAddress(
      WETH_CONTRACT_ADDRESS,
      NDX_ADDRESS
    );
    const [pairData] = pairsSelectors.selectPairsById(state, [wethNdxPair]);

    if (pairData) {
      const { token0, reserves0, reserves1 } = pairData;

      if (token0 && reserves0 && reserves1) {
        const firstIsNdx = NDX_ADDRESS.toLowerCase() === token0.toLowerCase();
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
