import { WETH_CONTRACT_ADDRESS } from "config";
import { computeUniswapPairAddress, getUrl, sendQuery } from "helpers";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import type { IndexPool, Swap as PoolSwap } from "indexed-types";
import type { NormalizedIndexPoolTransactions } from "./types";
import type { Swap as PoolTrade } from "uniswap-types";

// #region Index Pools
export async function queryIndexPools(url: string, poolAddresses: string[]) {
  const createPoolCall = (address: string) => `
          ${removeLeadingZero(address)}: indexPool(id: "${address}") {
              id
              category {
                  id
              }
              size
              name
              symbol
              isPublic
              initialized
              totalSupply
              totalWeight
              maxTotalSupply
              swapFee
              feesTotalUSD
              totalValueLockedUSD
              totalVolumeUSD
              totalSwapVolumeUSD
              tokensList
              poolInitializer {
                  id
                  totalCreditedWETH
                  tokens {
                  token {
                      id
                      address
                      decimals
                      name
                      symbol
                      priceUSD
                  }
                  balance
                  targetBalance
                  amountRemaining
                  }
              }
              tokens {
                  id
                  token {
                  id
                  address
                  decimals
                  name
                  symbol
                  priceUSD
                  }
                  ready
                  balance
                  denorm
                  desiredDenorm
                  minimumBalance
              }
              dailySnapshots(orderBy: date, orderDirection: desc, first: 90) {
                  id
                  date
                  value
                  totalSupply
                  feesTotalUSD
                  totalValueLockedUSD
                  totalSwapVolumeUSD
                  totalVolumeUSD
              }
          }
      `;
  const groupedCalls = `
      {
        ${poolAddresses.map(createPoolCall).join("\n")}
      }
    `;
  const pools = await sendQuery(url, groupedCalls);

  return pools;
}

export function normalizeIndexPools(response: Record<string, IndexPool>) {
  return Object.entries(response).reduce((prev, [key, value]) => {
    prev[addLeadingZero(key)] = value;
    return prev;
  }, {} as Record<string, IndexPool>);
}

export const fetchIndexPools = createAsyncThunk(
  "indexPools/fetch",
  async ({
    provider,
    arg: poolAddresses,
  }: {
    provider:
      | ethers.providers.Web3Provider
      | ethers.providers.JsonRpcProvider
      | ethers.providers.InfuraProvider;
    arg: string[];
  }) => {
    const { chainId } = await provider.getNetwork();
    const url = getUrl(chainId);
    const response = await queryIndexPools(url, poolAddresses);

    return normalizeIndexPools(response);
  }
);
// #endregion

// #region Index Pool Updates
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
  const updates = await sendQuery(groupedCalls, url);

  return updates;
}

export function normalizeIndexPoolUpdates(response: Record<string, IndexPool>) {
  return Object.entries(response).reduce((prev, [key, value]) => {
    prev[addLeadingZero(key)] = value;
    return prev;
  }, {} as Record<string, IndexPool>);
}

export const fetchIndexPoolUpdates = createAsyncThunk(
  "indexPools/fetchUpdates",
  async ({
    provider,
    arg: poolAddresses,
  }: {
    provider:
      | ethers.providers.Web3Provider
      | ethers.providers.JsonRpcProvider
      | ethers.providers.InfuraProvider;
    arg: string[];
  }) => {
    const { chainId } = await provider.getNetwork();
    const url = getUrl(chainId);
    const response = await queryIndexPoolUpdates(url, poolAddresses);

    return normalizeIndexPoolUpdates(response);
  }
);
// #endregion

// #region Transactions
export async function queryIndexPoolTransactions(
  url: string,
  poolAddresses: string[]
) {
  const createSingleSwapCall = (address: string) => `
      ${removeLeadingZero(
        address
      )}/swaps: swaps(orderBy: timestamp, orderDirection: desc, first:10, where: { pool: "${address}" }) {
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
      )}/trades: swaps(orderBy: timestamp, orderDirection: desc, first:10, where:{ pair: "${computeUniswapPairAddress(
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
  const groupedCalls = `
      {
        ${poolAddresses.map(createSingleSwapCall).join("\n")}
        ${poolAddresses.map(createSingleTradeCall).join("\n")}
      }
    `;
  const transactions = await sendQuery(url, groupedCalls);

  return transactions;
}

export function normalizeIndexPoolTransactions(
  response: Record<string, PoolSwap[] | PoolTrade[]>
) {
  return Object.entries(response).reduce((prev, [key, value]) => {
    const [address, kind] = key.split("/");
    const fixedAddress = addLeadingZero(address);
    const transactionKind = kind as "trades" | "swaps";
    const transactionValue =
      transactionKind === "trades"
        ? (value as PoolTrade[])
        : (value as PoolSwap[]);

    if (!prev[fixedAddress]) {
      prev[fixedAddress] = {
        swaps: [],
        trades: [],
      };
    }

    prev[fixedAddress][transactionKind].push(transactionValue as any);

    return prev;
  }, {} as Record<string, NormalizedIndexPoolTransactions>);
}

export const fetchIndexPoolTransactions = createAsyncThunk(
  "indexPools/fetchTransactions",
  async ({
    provider,
    arg: poolAddresses,
  }: {
    provider:
      | ethers.providers.Web3Provider
      | ethers.providers.JsonRpcProvider
      | ethers.providers.InfuraProvider;
    arg: string[];
  }) => {
    const { chainId } = await provider.getNetwork();
    const url = getUrl(chainId);
    const response = await queryIndexPoolTransactions(url, poolAddresses);

    return normalizeIndexPoolTransactions(response);
  }
);
// #endregion

// #region Helpers
const removeLeadingZero = (address: string) => address.slice(1);
const addLeadingZero = (address: string) => `0${address}`;
// #endregion
