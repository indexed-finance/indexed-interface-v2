import * as balancerMath from "ethereum/utils/balancer-math";
import { NormalizedPool } from "ethereum";
import { convert, createMulticallDataParser } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import {
  mirroredServerState,
  multicallDataReceived,
  poolTradesAndSwapsLoaded,
  restartedDueToError,
  subgraphDataLoaded,
} from "features/actions";
import type { CallWithResult } from "helpers";

export const adapter = createEntityAdapter<NormalizedPool>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const initialState = adapter.getInitialState();

export const POOL_CALLER = "Pool Detail";

export const EMPTY_TOKEN = {
  address: "",
  balance: "",
  minimumBalance: "",
  usedBalance: "",
  denorm: "",
  usedDenorm: "",
  usedWeight: "",
};

const slice = createSlice({
  name: "indexPools",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(multicallDataReceived, (state, action) => {
        const relevantMulticallData = poolMulticallDataParser(action.payload);

        if (relevantMulticallData) {
          for (const [poolAddress, results] of Object.entries(
            relevantMulticallData
          )) {
            const entry = state.entities[poolAddress];

            if (entry && results && Object.entries(results).length > 0) {
              entry.swapFee = results.swapFee;
              entry.totalDenorm = results.totalDenorm;
              entry.totalSupply = results.totalSupply;

              for (const token of results.tokens) {
                const tokenEntry = entry.tokens.entities[token.address];

                tokenEntry.balance = token.balance;
                tokenEntry.denorm = token.denorm;
                tokenEntry.minimumBalance = token.minimumBalance;
                tokenEntry.usedBalance = token.usedBalance;
                tokenEntry.usedDenorm = token.usedDenorm;
                tokenEntry.usedWeight = token.usedWeight;
              }
            }
          }
        }

        return state;
      })
      .addCase(subgraphDataLoaded, (state, action) => {
        const { pools } = action.payload;
        const fullPools = pools.ids.map((id) => pools.entities[id]);

        for (const { tokens } of fullPools) {
          for (const tokenId of tokens.ids) {
            const token = tokens.entities[tokenId];

            if (token.ready) {
              token.usedDenorm = token.denorm;
              token.usedBalance = token.balance;
            } else {
              token.usedDenorm = token.desiredDenorm;
              token.usedBalance = token.minimumBalance;
            }
          }
        }

        adapter.addMany(state, fullPools);
      })
      .addCase(poolTradesAndSwapsLoaded, (state, action) => {
        const { poolId, trades, swaps } = action.payload;
        const poolInState = state.entities[poolId];

        if (poolInState) {
          poolInState.trades = trades ?? poolInState.trades;
          poolInState.swaps = swaps ?? poolInState.swaps;
        }
      })
      .addCase(mirroredServerState, (_, action) => {
        const { indexPools } = action.payload;

        return indexPools;
      })
      .addCase(restartedDueToError, () => initialState),
});

export const { actions: indexPoolsActions, reducer: indexPoolsReducer } = slice;

// #region Helpers
const poolMulticallDataParser = createMulticallDataParser(
  POOL_CALLER,
  (calls) => {
    const formattedPoolDetails = calls.reduce((prev, next) => {
      const [poolAddress, functions] = next;
      const formattedPoolDetail = Object.entries(functions).reduce(
        (prev, next) => {
          const poolEntry = prev;
          const [fn, results] = next;
          const flattened = results.map((item: CallWithResult) => ({
            args: item.args ?? [],
            values: (item.result ?? []).map(convert.toBigNumber),
          }));

          try {
            if (flattened[0]?.values?.length > 0) {
              const poolLevelValue = flattened[0].values[0].toString(); // --
              const handlers: Record<string, () => void> = {
                getBalance: () =>
                  handleTokenResults("balance", poolEntry, flattened),
                getDenormalizedWeight: () =>
                  handleTokenResults("denorm", poolEntry, flattened),
                getMinimumBalance: () =>
                  handleTokenResults("minimumBalance", poolEntry, flattened),
                getSwapFee: () => {
                  poolEntry.swapFee = poolLevelValue;
                },
                getTotalDenormalizedWeight: () => {
                  poolEntry.totalDenorm = poolLevelValue;
                },
                totalSupply: () => {
                  poolEntry.totalSupply = poolLevelValue;
                },
              };
              const handler = handlers[fn];

              handler();
            }
          } catch (error) {
            console.error("uh oh", error);
          }

          return poolEntry;
        },
        {} as {
          indexPoolsblockNumber: number;
          totalDenorm: string;
          totalSupply: string;
          swapFee: string;
          tokens: Array<{
            address: string;
            balance: string;
            minimumBalance: string;
            usedBalance: string;
            denorm: string;
            usedDenorm: string;
            usedWeight: string;
          }>;
        }
      );

      for (const token of formattedPoolDetail.tokens ?? []) {
        const { balance, minimumBalance, denorm } = token;
        const [usedBalance, usedDenorm] = convert.toBigNumber(denorm).eq(0)
          ? [minimumBalance, balancerMath.MIN_WEIGHT]
          : [balance, denorm];
        const usedWeight = balancerMath
          .bdiv(
            convert.toBigNumber(usedDenorm),
            convert.toBigNumber(formattedPoolDetail.totalDenorm)
          )
          .toString();

        token.usedBalance = usedBalance;
        token.usedDenorm = usedDenorm.toString();
        token.usedWeight = usedWeight;
      }

      prev[poolAddress] = formattedPoolDetail;

      return prev;
    }, {} as Record<string, FormattedPoolDetail>);

    return formattedPoolDetails;
  }
);

type FormattedPoolDetail = {
  indexPoolsblockNumber: number;
  totalDenorm: string;
  totalSupply: string;
  swapFee: string;
  tokens: Array<{
    address: string;
    balance: string;
    minimumBalance: string;
    usedBalance: string;
    denorm: string;
    usedDenorm: string;
    usedWeight: string;
  }>;
};

function handleTokenResults(
  fieldName: keyof FormattedPoolDetail["tokens"][0],
  poolEntry: FormattedPoolDetail,
  calls: Array<{ args: string[]; values: any[] }>
) {
  for (const { args, values: flattenedValues } of calls) {
    const [address] = args;
    const relevantFieldValue = flattenedValues[0].toString();
    const intermediary = {
      address,
      [fieldName]: relevantFieldValue,
    };

    if (!poolEntry.tokens) {
      poolEntry.tokens = [];
    }

    const token = poolEntry.tokens.find((each) => each.address === address);

    if (token) {
      token[fieldName] = relevantFieldValue;
    } else {
      poolEntry.tokens.push({
        ...EMPTY_TOKEN,
        ...intermediary,
      });
    }
  }
}
// #endregion
