import { MIN_WEIGHT } from "./balancer-math";
import { dedupe } from "helpers";

import {
  NormalizedEntity,
  NormalizedInitialData,
  NormalizedToken,
  PoolTokenUpdate,
} from "ethereum/types.d";

import type { Category, PoolUnderlyingToken, Token } from "indexed-types";

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
      const categoryTokenIds = [];
      for (const categoryToken of category.tokens) {
        const { id: tokenId, symbol } = categoryToken;

        categoryTokenIds.push(tokenId);
        normalizedTokensForCategory.ids.push(tokenId);
        normalizedTokensForCategory.entities[tokenId] = {
          id: tokenId,
          symbol,
          coingeckoId: "",
        };
      }

      // Pool data.
      const categoryIndexPoolIds: string[] = [];
      for (const indexPool of category.indexPools) {
        const { dailySnapshots, tokens } = indexPool;

        categoryIndexPoolIds.push(indexPool.id);

        const dailySnapshotIds = [];
        for (const snapshot of dailySnapshots) {
          dailySnapshotIds.push(snapshot.id);
          prev.dailySnapshots.ids.push(snapshot.id);
          prev.dailySnapshots.entities[snapshot.id] = snapshot;
        }

        const tokenIds = [];
        const tokenEntities: Record<
          string,
          PoolTokenUpdate & PoolUnderlyingToken
        > = {};
        for (const token of tokens ?? []) {
          const [, tokenId] = token.id.split("-");

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

        prev.pools.ids.push(indexPool.id);
        prev.pools.entities[indexPool.id] = {
          ...indexPool,
          dailySnapshots: dailySnapshotIds,
          tokens: {
            ids: tokenIds,
            entities: tokenEntities,
          },
          trades: [],
          swaps: [],
          totalDenorm: "0",
          totalSupply: "0",
          swapFee: "0",
        };
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
      pools: {
        ids: [],
        entities: {},
      },
      dailySnapshots: {
        ids: [],
        entities: {},
      },
      tokens: {
        ids: [],
        entities: {},
      },
    } as NormalizedInitialData
  );
}
