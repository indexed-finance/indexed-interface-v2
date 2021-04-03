import { MIN_WEIGHT } from "./balancer-math";
import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import {
  NormalizedEntity,
  NormalizedInitialData,
  NormalizedPool,
  NormalizedStakingPool,
  NormalizedToken,
  PoolTokenUpdate,
} from "ethereum/types.d";
import { convert, dedupe } from "helpers";
import type {
  Category,
  NdxStakingPool,
  PoolUnderlyingToken,
  Token,
} from "indexed-types";
import type { FormattedIndexPool } from "features";

export function normalizeInitialData(categories: Category[]) {
  console.log({ categories });

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
      if (category.tokens.length === 0) {
        // "Borrow" the token data from the pools in the category.
        const tokensFromPools = category.indexPools
          .map(({ tokens }) => tokens)
          .filter((each): each is PoolUnderlyingToken[] => Boolean(each))
          .flat();

        for (const token of tokensFromPools) {
          normalizedTokensForCategory.ids.push(token.id);
          normalizedTokensForCategory.entities[token.id] = token.token;
        }
      } else {
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

          if (!normalizedTokensForCategory.ids.includes(tokenId)) {
            normalizedTokensForCategory.ids.push(tokenId);
            normalizedTokensForCategory.entities[tokenId] = {
              decimals: 18,
              symbol: "",
              ...token,
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

export function toFormattedAsset(
  token: NormalizedToken,
  pool?: NormalizedPool
): FormattedIndexPool["assets"][0] {
  const coingeckoData = token.priceData || {};
  const withDisplayedSigns = { signDisplay: "always" };

  let balance = "";
  let balanceUsd = "";
  let weightPercentage = "";

  if (pool) {
    const { balance: exactBalance, denorm } = pool.tokens.entities[token.id];

    const weight = convert.toBigNumber(denorm).div(pool.totalDenorm);
    weightPercentage = convert.toPercent(weight.toNumber());
    balance = convert.toBalance(exactBalance, token.decimals);

    if (coingeckoData.price) {
      balanceUsd = (coingeckoData.price * parseFloat(balance)).toString();
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
}

export function normalizeStakingData(
  data: NdxStakingPool[]
): NormalizedStakingPool[] {
  return data.map((pool) => {
    return {
      id: pool.id,
      rewardsDuration: 0,
      periodFinish: pool.periodFinish,
      rewardRate: pool.rewardRate,
      rewardPerTokenStored: pool.rewardPerTokenStored,
      totalSupply: pool.totalSupply,
      stakingToken: pool.stakingToken,
      indexPool: pool.indexPool,
      isWethPair: pool.isWethPair,
      startsAt: pool.startsAt,
      totalRewards: pool.totalRewards,
    };
  });
}
