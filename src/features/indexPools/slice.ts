import * as balancerMath from "ethereum/utils/balancer-math";
import { CallWithResult } from "../batcher/slice";
import { NormalizedPool, PoolTokenUpdate } from "ethereum";
import { PoolUnderlyingToken } from "indexed-types";
import { convert, createMulticallDataParser } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import {
  multicallDataReceived,
  poolTradesAndSwapsLoaded,
  poolUpdated,
  receivedInitialStateFromServer,
  receivedStatePatchFromServer,
  subgraphDataLoaded,
} from "features/actions";

export const adapter = createEntityAdapter<NormalizedPool>();

const POOL_PREFIX = "Pool Detail";
const EMPTY_TOKEN = {
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
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
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
      .addCase(multicallDataReceived, (state, action) => {
        const relevantMulticallData = poolMulticallDataParser(action.payload);

        if (relevantMulticallData) {
          for (const [poolAddress, results] of Object.entries(
            relevantMulticallData
          )) {
            const entry = state.entities[poolAddress];

            try {
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
            } catch (error) {
              console.log("wow", error);
            }
          }
        }

        return state;
      })
      .addCase(poolUpdated, (state, action) => {
        const { pool, update } = action.payload;

        const poolInState = state.entities[pool.id];

        if (poolInState) {
          const { $blockNumber: _, tokens, ...rest } = update;
          const tokenEntities: Record<
            string,
            PoolTokenUpdate & PoolUnderlyingToken
          > = {};

          for (const token of tokens) {
            const { address, ...tokenUpdate } = token;
            const tokenInState = pool.tokens.entities[address];
            tokenEntities[address.toLowerCase()] = {
              ...tokenInState,
              ...tokenUpdate,
            };
          }

          state.entities[pool.id] = {
            ...poolInState,
            ...rest,
            tokens: {
              ids: poolInState.tokens.ids,
              entities: tokenEntities,
            },
          };
        }
      })
      .addCase(poolTradesAndSwapsLoaded, (state, action) => {
        const { poolId, trades, swaps } = action.payload;
        const poolInState = state.entities[poolId];

        if (poolInState) {
          poolInState.trades = trades ?? poolInState.trades;
          poolInState.swaps = swaps ?? poolInState.swaps;
        }
      })
      .addCase(receivedInitialStateFromServer, (_, action) => {
        const { indexPools } = action.payload;
        return indexPools;
      })
      .addCase(receivedStatePatchFromServer, (_, action) => {
        const { indexPools } = action.payload;

        return indexPools;
      }),
});

export const { actions } = slice;

export default slice.reducer;

// #region Helpers
const poolMulticallDataParser = createMulticallDataParser(
  POOL_PREFIX,
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
          $blockNumber: number;
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
  $blockNumber: number;
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
