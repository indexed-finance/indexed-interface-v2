import * as balancerMath from "ethereum/utils/balancer-math";
import { convert, createMulticallDataParser } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchIndexPoolTransactions } from "./requests";
import { fetchInitialData } from "../requests";
import { fetchMulticallData } from "../batcher/requests"; // Circular dependency.
import { mirroredServerState, restartedDueToError } from "../actions";
import type { CallWithResult } from "helpers";
import type {
  FormattedPoolAsset,
  FormattedPoolDetail,
  NormalizedIndexPool,
} from "./types";
import type { NormalizedToken } from "../tokens";

export const adapter = createEntityAdapter<NormalizedIndexPool>({
  selectId: (entry) => entry.id.toLowerCase(),
});

export const POOL_CALLER = "Pool Data";

const slice = createSlice({
  name: "indexPools",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        const relevantMulticallData = poolMulticallDataParser(action.payload);

        if (relevantMulticallData) {
          for (const [poolAddress, results] of Object.entries(
            relevantMulticallData
          )) {
            const entry = state.entities[poolAddress.toLowerCase()];

            if (entry && results && Object.entries(results).length > 0) {
              if (results.swapFee) entry.swapFee = results.swapFee;
              if (results.totalDenorm) entry.totalDenorm = results.totalDenorm;
              if (results.totalSupply) entry.totalSupply = results.totalSupply;

              for (const token of results.tokens) {
                const tokenEntry =
                  entry.tokens.entities[token.address.toLowerCase()];
                if (tokenEntry) {
                  if (token.balance) tokenEntry.balance = token.balance;
                  if (token.denorm) tokenEntry.denorm = token.denorm;
                  if (token.minimumBalance)
                    tokenEntry.minimumBalance = token.minimumBalance;
                  if (token.usedBalance)
                    tokenEntry.usedBalance = token.usedBalance;
                  if (token.usedDenorm)
                    tokenEntry.usedDenorm = token.usedDenorm;
                  if (token.usedWeight)
                    tokenEntry.usedWeight = token.usedWeight;
                }
              }
            }
          }
        }

        return state;
      })
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        if (action.payload) {
          const { indexPools } = action.payload;
          const fullPools = indexPools.ids.map((id) => indexPools.entities[id]);

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
        }
      })
      .addCase(fetchIndexPoolTransactions.fulfilled, (state, action) => {
        for (const [pool, transactions] of Object.entries(action.payload)) {
          const poolInState = state.entities[pool];

          if (poolInState) {
            poolInState.transactions = transactions;
          }
        }
      })
      .addCase(mirroredServerState, (_, action) => action.payload.indexPools)
      .addCase(restartedDueToError, () => adapter.getInitialState()),
});

export const { actions: indexPoolsActions, reducer: indexPoolsReducer } = slice;

// #region Helpers
export const poolMulticallDataParser = createMulticallDataParser(
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
          } catch {
            console.error("Some weird error.");
          }

          return poolEntry;
        },
        {} as {
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

export function formatPoolAsset(
  token?: NormalizedToken,
  pool?: NormalizedIndexPool
): FormattedPoolAsset {
  if (token) {
    const coingeckoData = token.priceData || {};
    const withDisplayedSigns = { signDisplay: "always" };

    let balance = "";
    let balanceUsd = "";
    let weightPercentage = "";

    if (pool) {
      const { balance: exactBalance, denorm } = pool.tokens.entities[token.id];

      const weight = convert.toBigNumber(denorm).div(pool.totalDenorm);
      weightPercentage = convert.toPercent(weight.toNumber());

      balance = parseFloat(
        convert.toBalance(exactBalance, token.decimals)
      ).toFixed(2);

      if (coingeckoData.price) {
        balanceUsd = convert.toCurrency(
          coingeckoData.price * parseFloat(balance)
        );
      }
    }

    return {
      id: token.id,
      symbol: token.symbol,
      name: token.name ?? "",
      balance,
      balanceUsd,
      price: coingeckoData.price ? convert.toCurrency(coingeckoData.price) : "",
      netChange: coingeckoData.change24Hours
        ? convert.toCurrency(coingeckoData.change24Hours, withDisplayedSigns)
        : "",
      netChangePercent: coingeckoData.percentChange24Hours
        ? convert.toPercent(
            coingeckoData.percentChange24Hours / 100,
            withDisplayedSigns
          )
        : "",
      isNegative: Boolean(
        coingeckoData.change24Hours && coingeckoData.change24Hours < 0
      ),
      weightPercentage,
    };
  } else {
    return {
      id: "",
      symbol: "",
      name: "",
      balance: "",
      balanceUsd: "",
      price: "",
      netChange: "",
      netChangePercent: "",
      isNegative: false,
      weightPercentage: "",
    };
  }
}

export function handleTokenResults(
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
        balance: "",
        minimumBalance: "",
        usedBalance: "",
        denorm: "",
        usedDenorm: "",
        usedWeight: "",
        ...intermediary,
      });
    }
  }
}
// #endregion
