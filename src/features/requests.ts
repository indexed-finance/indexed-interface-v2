import * as batcherRequests from "./batcher/requests";
import * as indexPoolsRequests from "./indexPools/requests";
import * as newStakingRequests from "./newStaking/requests";
import * as stakingRequests from "./staking/requests";
import * as tokensRequests from "./tokens/requests";
import { MIN_WEIGHT } from "ethereum";
import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import { convert, dedupe } from "helpers";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { getIndexedUrl, sendQuery } from "helpers";
import type { Category, PoolUnderlyingToken, Token } from "indexed-types";
import type { NormalizedCategory } from "./categories";
import type { NormalizedDailySnapshot } from "./dailySnapshots";
import type {
  NormalizedIndexPool,
  NormalizedIndexPoolTokenUpdate,
} from "./indexPools";
import type { NormalizedToken } from "./tokens";

export type NormalizedEntity<T> = {
  ids: string[];
  entities: Record<string, T>;
};

export type NormalizedInitialData = {
  categories: NormalizedEntity<
    Pick<NormalizedCategory, "tokens" | "indexPools">
  >;
  dailySnapshots: NormalizedEntity<NormalizedDailySnapshot>;
  indexPools: NormalizedEntity<NormalizedIndexPool>;
  tokens: NormalizedEntity<NormalizedToken>;
};

export interface OffChainRequest {
  provider:
    | ethers.providers.Web3Provider
    | ethers.providers.JsonRpcProvider
    | ethers.providers.InfuraProvider;
  arg?: string[];
}

export async function queryInitialData(url: string): Promise<Category[]> {
  try {
    const { categories } = await sendQuery(
      url,
      `
      {
        categories (first: 1000) {
          id
          tokens {
            id
            decimals
            name
            symbol
            priceUSD
          }
          indexPools {
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
                id
                token {
                  id
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
                symbol
                decimals
              }
              ready
              balance
              minimumBalance
              denorm
              desiredDenorm
            }
            dailySnapshots(orderBy: date, orderDirection: desc, first: 168) {
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
        }
      }
    `
    );

    return categories;
  } catch (error) {
    return [];
  }
}

export function normalizeInitialData(categories: Category[]) {
  return categories.reduce(
    (prev, next) => {
      const category = next;
      const normalizedTokensForCategory = {
        ids: [],
        entities: {},
        // Category data.
      } as NormalizedEntity<NormalizedToken>;
      prev.categories.ids.push(category.id);
      prev.categories.entities[category.id] = {
        indexPools: category.indexPools.map(({ id }) => id),
        tokens: {
          ids: category.tokens.map(({ id }) => id),
          entities: category.tokens.reduce((prev, next) => {
            prev[next.id] = next;
            return prev;
          }, {} as Record<string, Token>),
        },
      };

      // Token data.
      if (category.tokens.length > 0) {
        for (const categoryToken of category.tokens) {
          const { id: tokenId, symbol, name, decimals } = categoryToken;
          normalizedTokensForCategory.ids.push(tokenId);
          normalizedTokensForCategory.entities[tokenId] = {
            id: tokenId,
            name,
            decimals,
            symbol,
          };
        }
      }

      // Pool data.
      const categoryIndexPoolIds: string[] = [];
      for (const indexPool of category.indexPools) {
        const { dailySnapshots, tokens, totalSupply, totalWeight } = indexPool;

        categoryIndexPoolIds.push(indexPool.id);

        const dailySnapshotIds = [];
        for (const snapshot of dailySnapshots) {
          dailySnapshotIds.push(snapshot.id);
          prev.dailySnapshots.ids.push(snapshot.id);
          prev.dailySnapshots.entities[snapshot.id] = {
            ...snapshot,
            value: parseFloat(snapshot.value),
          };
        }

        const tokenIds = [];
        const tokenEntities: Record<
          string,
          NormalizedIndexPoolTokenUpdate & PoolUnderlyingToken
        > = {};
        for (const token of tokens ?? []) {
          const [, tokenId] = token.id.split("-");

          if (!normalizedTokensForCategory.ids.includes(tokenId)) {
            normalizedTokensForCategory.ids.push(tokenId);
            normalizedTokensForCategory.entities[tokenId] = {
              ...token.token,
              id: tokenId,
            };
          }

          tokenIds.push(tokenId);
          const extras = token.ready
            ? {
                usedBalance: token.balance,
                usedDenorm: token.denorm,
              }
            : {
                usedBalance: token.minimumBalance,
                usedDenorm: MIN_WEIGHT,
              };
          tokenEntities[tokenId] = {
            ...(tokenEntities[tokenId] ?? {}),
            ...token,
            ...extras,
          };
        }

        prev.indexPools.ids.push(indexPool.id);
        prev.indexPools.entities[indexPool.id] = {
          ...indexPool,
          dailySnapshots: dailySnapshotIds,
          tokens: {
            ids: tokenIds,
            entities: tokenEntities,
          },
          transactions: {
            swaps: [],
            trades: [],
          },
          totalDenorm: totalWeight,
          totalSupply,
          swapFee: convert.toToken("0.025", 18).toString(10),
        };

        if (indexPool.initialized) {
          prev.tokens.ids.push(indexPool.id.toLowerCase());
          prev.tokens.entities[indexPool.id.toLowerCase()] = {
            id: indexPool.id.toLowerCase(),
            name: indexPool.name,
            symbol: indexPool.symbol,
            decimals: 18,
          };
        }
      }

      prev.tokens.ids = dedupe(
        prev.tokens.ids.concat(normalizedTokensForCategory.ids)
      );

      for (const id of normalizedTokensForCategory.ids) {
        prev.tokens.entities[id] = normalizedTokensForCategory.entities[id];
      }

      return prev;
    },
    {
      categories: {
        ids: [],
        entities: {},
      },
      indexPools: {
        ids: [],
        entities: {},
      },
      dailySnapshots: {
        ids: [],
        entities: {},
      },
      tokens: {
        ids: [WETH_CONTRACT_ADDRESS.toLowerCase(), NDX_ADDRESS.toLowerCase()],
        entities: {
          [WETH_CONTRACT_ADDRESS.toLowerCase()]: {
            id: WETH_CONTRACT_ADDRESS.toLowerCase(),
            name: "Wrapped Ether",
            symbol: "WETH",
            decimals: 18,
          },
          [NDX_ADDRESS.toLowerCase()]: {
            id: NDX_ADDRESS.toLowerCase(),
            name: "Indexed",
            symbol: "NDX",
            decimals: 18,
          },
        },
      },
    } as NormalizedInitialData
  );
}

export const fetchInitialData = createAsyncThunk(
  "fetchInitialData",
  async ({ provider }: OffChainRequest) => {
    const { chainId } = provider.network;
    const url = getIndexedUrl(chainId);

    try {
      const initial = await queryInitialData(url);

      return normalizeInitialData(initial);
    } catch (error) {
      return null;
    }
  }
);

export const requests = {
  ...batcherRequests,
  ...indexPoolsRequests,
  ...stakingRequests,
  ...newStakingRequests,
  ...tokensRequests,
  fetchInitialData,
};
