import { WETH_CONTRACT_ADDRESS } from "config";
import {
  computeUniswapPairAddress,
  getIndexedUrl,
  getUniswapUrl,
  sendQuery,
} from "helpers";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IndexPool, Swap as PoolSwap } from "indexed-types";
import type { NormalizedIndexPoolTransactions } from "./types";
import type { OffChainRequest } from "../requests";
import type { Swap as PoolTrade } from "uniswap-types";

export function normalizeIndexPools(response: Record<string, IndexPool>) {
  return Object.entries(response).reduce((prev, [key, value]) => {
    prev[addLeadingZero(key)] = value;
    return prev;
  }, {} as Record<string, IndexPool>);
}

// #endregion

// #region Updates
export async function queryIndexPoolUpdates(
  url: string,
  poolAddresses: string[]
): Promise<Record<string, IndexPool>> {
  const createUpdateCall = (address: string) => `
    ${removeLeadingZero(address)}: indexPool(id: "${address}") {
        dailySnapshots(orderBy: date, orderDirection: desc, first: 1) {
            id
            date
            value
            totalSupply
            feesTotalUSD
            totalValueLockedUSD
            totalSwapVolumeUSD
            totalVolumeUSD
        }
        tokens {
            token {
            id
            decimals
            name
            symbol
            priceUSD
            }
        }
        }
    `;
  const groupedCalls = `
      {
        ${poolAddresses.map(createUpdateCall).join("\n")}
      }
    `;

  try {
    const updates = await sendQuery(url, groupedCalls);

    return updates;
  } catch (error) {
    return {};
  }
}

export function normalizeIndexPoolUpdates(response: Record<string, IndexPool>) {
  return Object.entries(response).reduce((prev, [key, value]) => {
    prev[addLeadingZero(key)] = value;
    return prev;
  }, {} as Record<string, IndexPool>);
}

export const fetchIndexPoolUpdates = createAsyncThunk(
  "indexPools/fetchUpdates",
  async ({ provider, arg: poolAddresses = [] }: OffChainRequest) => {
    const { chainId } = await provider.getNetwork();
    const url = getIndexedUrl(chainId);
    const response = await queryIndexPoolUpdates(url, poolAddresses);

    return normalizeIndexPoolUpdates(response);
  }
);
// #endregion

// #region Transactions
export async function queryIndexPoolTransactions(
  { indexedUrl, uniswapUrl }: { indexedUrl: string; uniswapUrl: string },
  poolAddresses: string[]
) {
  const createSingleSwapCall = (address: string) => `
      ${removeLeadingZero(
        address
      )}: swaps(orderBy: timestamp, orderDirection: desc, first:10, where: { pool: "${address}" }) {
        id
        tokenIn
        tokenOut
        tokenAmountIn
        tokenAmountOut
        timestamp
      }
    `;
  const createSingleTradeCall = (address: string) => `
      ${removeLeadingZero(
        address
      )}: swaps(orderBy: timestamp, orderDirection: desc, first:10, where:{ pair: "${computeUniswapPairAddress(
    address,
    WETH_CONTRACT_ADDRESS
  ).toLowerCase()}"}) {
        transaction {
          id
        }
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        amount0In
        amount1In
        amount0Out
        amount1Out
        amountUSD
        timestamp
      }
    `;
  const swapCall = `{${poolAddresses.map(createSingleSwapCall).join("\n")}}`;
  const tradeCall = `{${poolAddresses.map(createSingleTradeCall).join("\n")}}`;

  try {
    const swaps = await sendQuery(indexedUrl, swapCall);
    const trades = await sendQuery(uniswapUrl, tradeCall);

    return { swaps, trades };
  } catch (error) {
    return { swaps: [], trades: [] };
  }
}

export function normalizeIndexPoolTransactions(
  poolAddresses: string[],
  swaps: Record<string, PoolSwap[]>,
  trades: Record<string, PoolTrade[]>
) {
  return poolAddresses.reduce((prev, next) => {
    const address = next;
    const graphqlSafeAddress = removeLeadingZero(address);

    prev[address] = {
      swaps: swaps[graphqlSafeAddress],
      trades: trades[graphqlSafeAddress],
    };

    return prev;
  }, {} as Record<string, NormalizedIndexPoolTransactions>);
}

export const fetchIndexPoolTransactions = createAsyncThunk(
  "indexPools/fetchTransactions",
  async ({ provider, arg: poolAddresses = [] }: OffChainRequest) => {
    try {
      const { chainId } = await provider.getNetwork();
      const { swaps, trades } = await queryIndexPoolTransactions(
        {
          indexedUrl: getIndexedUrl(chainId),
          uniswapUrl: getUniswapUrl(chainId),
        },
        poolAddresses
      );

      return normalizeIndexPoolTransactions(poolAddresses, swaps, trades);
    } catch (error) {
      return {};
    }
  }
);
// #endregion

// #region Helpers
const removeLeadingZero = (address: string) => address.slice(1);
const addLeadingZero = (address: string) => `0${address}`;
// #endregion
