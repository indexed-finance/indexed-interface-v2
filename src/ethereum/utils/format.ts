import { FormattedIndexPool } from "features";
import { MIN_WEIGHT } from "./balancer-math";
import {
  NormalizedCategory,
  NormalizedEntity,
  NormalizedInitialData,
  NormalizedPool,
  NormalizedToken,
  PoolTokenUpdate,
} from "ethereum/types.d";
import { convert, dedupe } from "helpers";
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
        const { id: tokenId, symbol, name, decimals } = categoryToken;
        categoryTokenIds.push(tokenId);
        normalizedTokensForCategory.ids.push(tokenId);
        normalizedTokensForCategory.entities[tokenId] = {
          id: tokenId,
          name,
          decimals,
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

        if (indexPool.initialized) {
          prev.tokens.ids.push(indexPool.id.toLowerCase());
          prev.tokens.entities[indexPool.id.toLowerCase()] = {
            id: indexPool.id.toLowerCase(),
            name: indexPool.name,
            symbol: indexPool.symbol,
            decimals: 18,
            coingeckoId: "",
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

export function toFormattedAsset(
  category: NormalizedCategory,
  token: NormalizedToken,
  pool?: NormalizedPool,
  poolTokenWeights?: Record<string, string>
): FormattedIndexPool["assets"][0] {
  const categoryToken = category.tokens.entities[token.id];
  const coingeckoData = token.priceData || {};
  const withDisplayedSigns = { signDisplay: "always" };

  let balance = "";
  let balanceUsd = "";
  let weightPercentage = "-";

  if (pool) {
    balance = pool.tokens.entities[token.id].balance;
    const parsedBalance = parseFloat(balance.replace(/,/g, ""));
    balance = convert.toBalance(balance);

    if (coingeckoData.price) {
      balanceUsd = convert.toBalance(
        (coingeckoData.price * parsedBalance).toString()
      );
    }

    if (poolTokenWeights) {
      const tokenWeight = poolTokenWeights[token.id];

      if (tokenWeight) {
        weightPercentage = convert.toPercent(
          parseFloat(convert.toBalance(tokenWeight))
        );
      }
    }
  }

  return {
    id: token.id,
    symbol: token.symbol,
    name: categoryToken?.name ?? "",
    balance,
    balanceUsd,
    price: coingeckoData.price ? convert.toCurrency(coingeckoData.price) : "-",
    netChange: coingeckoData.change24Hours
      ? convert.toCurrency(coingeckoData.change24Hours, withDisplayedSigns)
      : "-",
    netChangePercent: coingeckoData.percentChange24Hours
      ? convert.toPercent(
          coingeckoData.percentChange24Hours / 100,
          withDisplayedSigns
        )
      : "-",
    isNegative: Boolean(
      coingeckoData.change24Hours && coingeckoData.change24Hours < 0
    ),
    weightPercentage,
  };
}
