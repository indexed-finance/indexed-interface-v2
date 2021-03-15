import { NormalizedPool, NormalizedToken } from "ethereum";
import { batcherSelectors } from "./batcher";
import { categoriesSelectors } from "./categories";
import { convert } from "helpers";
import { dailySnapshotsSelectors } from "./dailySnapshots";
import { formatDistance } from "date-fns";
import { indexPoolsSelectors } from "./indexPools";
import { pairsSelectors } from "./pairs";
import { settingsSelectors } from "./settings";
import { tokensSelectors } from "./tokens";
import { userSelectors } from "./user";
import S from "string";
import type { AppState } from "./store";

const MILLISECONDS_PER_SECOND = 1000;

type ModelKeys = "categories" | "indexPools";

const selectors = {
  ...batcherSelectors,
  ...categoriesSelectors,
  ...dailySnapshotsSelectors,
  ...indexPoolsSelectors,
  ...settingsSelectors,
  ...tokensSelectors,
  ...userSelectors,
  ...pairsSelectors,
  /**
   *
   * @param state -
   */
  selectMenuModels: (
    state: AppState
  ): Record<
    ModelKeys,
    Array<{ name: string; id: string; symbol: string; slug: string }>
  > => {
    const categories = selectors
      .selectAllFormattedCategories(state)
      .map(({ slug, id, symbol, name }: any) => ({
        id,
        symbol,
        name,
        slug,
      }));
    const indexPools = selectors
      .selectAllFormattedIndexPools(state)
      .filter(Boolean)
      .map(({ slug, id, symbol, name }: any) => ({
        id,
        symbol,
        slug,
        name: name.replace(/Tokens Index/g, ""),
      }));

    return {
      categories,
      indexPools,
    };
  },
  /**
   *
   * @param state -
   * @param poolId -
   */
  selectFormattedCategory: (state: AppState, categoryName: string) => {
    const category = selectors.selectCategoryByName(state, categoryName);
    const indexPoolLookup = selectors.selectPoolLookup(state);

    if (category) {
      return {
        id: category.id,
        symbol: category.symbol,
        name: category.name,
        slug: S(category.name).slugify().s,
        brief: category.brief,
        description: category.description,
        indexPools: category.indexPools
          .map((id) => indexPoolLookup[id])
          .filter(Boolean)
          .map((pool) => {
            const guaranteedPool = pool as NormalizedPool;
            const swapFee = selectors.selectFormattedSwapFee(
              state,
              guaranteedPool.id
            );
            const price = convert.toToken(
              convert
                .toBigNumber(guaranteedPool.totalValueLockedUSD)
                .dividedBy(convert.toBigNumber(guaranteedPool.totalSupply))
            );

            return {
              id: guaranteedPool.id,
              name: guaranteedPool.name,
              slug: S(guaranteedPool.name).slugify().s,
              symbol: guaranteedPool.symbol,
              size: guaranteedPool.size.toString(),
              price: convert.toCurrency(price.toNumber()),
              supply: convert.toComma(
                parseFloat(convert.toBalance(guaranteedPool.totalSupply))
              ),
              marketCap: convert.toCurrency(guaranteedPool.totalValueLockedUSD),
              swapFee,
              cumulativeFees: convert.toCurrency(guaranteedPool.feesTotalUSD),
              volume: convert.toCurrency(guaranteedPool.totalVolumeUSD),
            };
          }),
        tokens: category.tokens,
      };
    } else {
      return null;
    }
  },
  /**
   *
   * @param state -
   */
  selectAllFormattedCategories: (state: AppState) => {
    return selectors
      .selectAllCategories(state)
      .map((category) =>
        selectors.selectFormattedCategory(state, category.name)
      )
      .filter(Boolean);
  },
  /**
   *
   * @param state -
   * @param poolId -
   */
  selectFormattedIndexPool: (
    state: AppState,
    poolId: string
  ): null | FormattedIndexPool => {
    const pool = selectors.selectPool(state, poolId);
    const tokenIds = pool?.tokens.ids ?? [];

    if (pool) {
      const tokens = selectors.selectTokenLookup(state);
      const tokenWeights = selectors.selectTokenWeights(
        state,
        pool.id,
        tokenIds
      );
      const category = selectors.selectCategory(state, pool.category.id);
      const stats = selectors.selectPoolStats(state, pool.id);
      const withDisplayedSigns = { signDisplay: "always" };

      return {
        category: category?.name ?? "",
        canStake: false,
        id: pool.id,
        symbol: pool.symbol,
        priceUsd: convert.toCurrency(stats.price),
        netChange: convert.toCurrency(
          stats.deltas.price.day.value,
          withDisplayedSigns
        ),
        netChangePercent: convert.toPercent(
          stats.deltas.price.day.percent,
          withDisplayedSigns
        ),
        isNegative: stats.deltas.price.day.value < 0,
        name: pool.name.replace(/Tokens Index/g, ""),
        slug: S(pool.name).slugify().s,
        volume: convert.toCurrency(stats.deltas.volume.day),
        totalValueLocked: convert.toCurrency(pool.totalValueLockedUSD),
        totalValueLockedPercent: convert.toPercent(
          stats.deltas.totalValueLockedUSD.day.percent
        ),
        swapFee: convert.toPercent(parseFloat(convert.toBalance(pool.swapFee))),
        cumulativeFee: convert.toCurrency(pool.feesTotalUSD),
        recent: {
          swaps: (pool.swaps ?? []).map((swap) => {
            const from = selectors.selectTokenSymbol(state, swap.tokenIn);
            const to = selectors.selectTokenSymbol(state, swap.tokenOut);
            const [transactionHash] = swap.id.split("-");

            return {
              when: formatDistance(
                new Date(swap.timestamp * MILLISECONDS_PER_SECOND),
                new Date()
              ),
              from,
              to,
              transactionHash,
            };
          }),
          trades: (pool.trades ?? []).map((trade) => ({
            when: formatDistance(
              new Date(parseInt(trade.timestamp) * MILLISECONDS_PER_SECOND),
              new Date()
            ),
            from: trade.pair.token0.symbol,
            to: trade.pair.token1.symbol,
            amount: convert.toCurrency(parseFloat(trade.amountUSD)),
            kind:
              trade.pair.token0.symbol.toLowerCase() ===
              pool.symbol.toLowerCase()
                ? "sell"
                : "buy",
            transactionHash: trade.transaction.id,
          })),
        },
        assets: tokenIds
          .map((poolTokenId) => {
            const token = tokens[poolTokenId];

            if (category && token) {
              const categoryToken = category.tokens.entities[token.id];
              const coingeckoData = token.priceData || {};
              const { balance } = pool.tokens.entities[token.id];
              const parsedBalance = parseFloat(balance.replace(/,/g, ""));
              const balanceUsd = coingeckoData.price
                ? convert.toBalance(
                    (coingeckoData.price * parsedBalance).toString()
                  )
                : null;
              const tokenWeight = tokenWeights[token.id];
              const weightPercentage = tokenWeight
                ? convert.toPercent(parseFloat(convert.toBalance(tokenWeight)))
                : "-";

              return {
                id: token.id,
                symbol: token.symbol,
                name: categoryToken?.name ?? "",
                balance: convert.toBalance(balance),
                balanceUsd,
                price: coingeckoData.price
                  ? convert.toCurrency(coingeckoData.price)
                  : "-",
                netChange: coingeckoData.change24Hours
                  ? convert.toCurrency(
                      coingeckoData.change24Hours,
                      withDisplayedSigns
                    )
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
            } else {
              return {
                id: "",
                symbol: "",
                name: "",
                balance: "",
                balanceUsd: "",
                price: "-",
                netChange: "-",
                netChangePercent: "-",
                isNegative: false,
                weightPercentage: "",
              };
            }
          })
          .sort(
            (left, right) =>
              parseFloat(right.weightPercentage) -
              parseFloat(left.weightPercentage)
          ),
      };
    } else {
      return null;
    }
  },
  /**
   *
   * @param state -
   */
  selectAllFormattedIndexPools: (state: AppState) => {
    return selectors
      .selectAllPools(state)
      .map((pool) => selectors.selectFormattedIndexPool(state, pool.id))
      .filter(Boolean);
  },
};

export default selectors;

export type SelectorType = typeof selectors;

export interface FormattedCategory {
  id: string;
  symbol: string;
  name: string;
  slug: string;
  brief?: string;
  indexPools: Array<{
    name: string;
    slug: string;
    symbol: string;
    size: string;
    price: string;
    supply: string;
    marketCap: string;
    swapFee: string;
    cumulativeFees: string;
    volume: string;
  }>;
  tokens: Array<{ name: string; symbol: string }>;
}

export interface FormattedIndexPool {
  category: string;
  canStake: boolean;
  id: string;
  symbol: string;
  priceUsd: string;
  netChange: string;
  netChangePercent: string;
  isNegative: boolean;
  name: string;
  slug: string;
  volume: string;
  totalValueLocked: string;
  totalValueLockedPercent: string;
  swapFee: string;
  cumulativeFee: string;
  // chart data
  recent: {
    swaps: Array<{
      when: string;
      from: string;
      to: string;
      transactionHash: string;
    }>;
    trades: Array<{
      kind: "buy" | "sell";
      amount: string;
      when: string;
      from: string;
      to: string;
      transactionHash: string;
    }>;
  };
  assets: Array<{
    id: string;
    symbol: string;
    name: string;
    price: string;
    balance: string;
    balanceUsd: null | string;
    netChange: string;
    netChangePercent: string;
    isNegative: boolean;
    weightPercentage: string;
  }>;
}

export interface FormattedPair {
  id: string;
  exists: boolean;
  token0: NormalizedToken;
  token1: NormalizedToken;
  reserves0: string;
  reserves1: string;
}

export type Swap = FormattedIndexPool["recent"]["swaps"][0];
export type Trade = FormattedIndexPool["recent"]["trades"][0];
export type Asset = FormattedIndexPool["assets"][0];
