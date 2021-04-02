import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import { NormalizedPool, NormalizedToken } from "ethereum";
import { Pair } from "uniswap-types";
import { batcherSelectors } from "./batcher";
import { cacheSelectors } from "./cache";
import { categoriesSelectors } from "./categories";
import { computeUniswapPairAddress, convert } from "helpers";
import { createSelector } from "reselect";
import { dailySnapshotsSelectors } from "./dailySnapshots";
import { formatDistance } from "date-fns";
import { indexPoolsSelectors } from "./indexPools";
import { pairsSelectors } from "./pairs";
import { settingsSelectors } from "./settings";
import { stakingSelectors } from "./staking";
import { toFormattedAsset } from "ethereum/utils";
import { tokensSelectors } from "./tokens";
import { userSelectors } from "./user";
import S from "string";
import type { AppState } from "./store";

const MILLISECONDS_PER_SECOND = 1000;

type ModelKeys = "categories" | "indexPools";

export const selectors = {
  ...batcherSelectors,
  ...cacheSelectors,
  ...categoriesSelectors,
  ...dailySnapshotsSelectors,
  ...indexPoolsSelectors,
  ...settingsSelectors,
  ...stakingSelectors,
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
  selectFormattedIndexPool: createSelector(
    [
      indexPoolsSelectors.selectPool,
      tokensSelectors.selectTokenLookup,
      dailySnapshotsSelectors.selectPoolStats,
    ],
    (pool, tokens, stats) => {
      const tokenIds = pool?.tokens.ids ?? [];

      if (pool) {
        const withDisplayedSigns = { signDisplay: "always" };

        return {
          category: pool.category.id,
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
          swapFee: convert.toPercent(
            parseFloat(convert.toBalance(pool.swapFee))
          ),
          cumulativeFee: convert.toCurrency(pool.feesTotalUSD),
          recent: {
            swaps: (pool.swaps ?? []).map((swap) => {
              const from = tokens[swap.tokenIn.toLowerCase()]?.symbol;
              const to = tokens[swap.tokenOut.toLowerCase()]?.symbol;
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

              if (token) {
                return toFormattedAsset(token, pool);
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
            })
            .sort(
              (left, right) =>
                parseFloat(right.weightPercentage) -
                parseFloat(left.weightPercentage)
            ),
        } as FormattedIndexPool;
      } else {
        return null;
      }
    }
  ),
  selectNormalizedUnderlyingPoolTokens: (state: AppState, poolId: string) => {
    const tokenIds = selectors.selectPoolTokenAddresses(state, poolId);
    return selectors.selectTokensById(state, tokenIds);
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
  selectStakingTokenPrices(state: AppState, pairs: Pair[]) {
    const pools = selectors.selectAllStakingPools(state);
    const lookup = pairs.reduce((prev, next) => {
      prev[(next as any).liquidityToken.address.toLowerCase()] = next;
      return prev;
    }, {} as Record<string, Pair>);

    return pools.reduce((prev, next) => {
      const { indexPool: poolAddress } = next;
      const mostRecentSnapshot = selectors.selectMostRecentSnapshotOfPool(
        state,
        poolAddress
      );
      const mostRecentValue = mostRecentSnapshot?.value ?? 0;

      if (next.isWethPair) {
        const entry = lookup[next.stakingToken.toLowerCase()];

        if (entry?.token0?.id && entry?.token1?.id) {
          const indexPoolSideReserve =
            entry.token0.id.toLowerCase() === poolAddress.toLowerCase()
              ? entry.reserve0
              : entry.reserve1;
          const price = convert
            .toBigNumber(indexPoolSideReserve)
            .multipliedBy(2)
            .dividedBy(convert.toBigNumber(entry.totalSupply))
            .multipliedBy(mostRecentValue)
            .toString();

          prev[next.stakingToken] = price;
        } else {
          prev[next.stakingToken] = "0";
        }
      } else {
        prev[next.stakingToken] = mostRecentValue;
      }

      return prev;
    }, {} as Record<string, string>);
  },
  selectNdxPrice(state: AppState, ethPrice: number) {
    const wethNdxPair = computeUniswapPairAddress(
      WETH_CONTRACT_ADDRESS,
      NDX_ADDRESS
    );
    const [pairData] = selectors.selectPairsById(state, [wethNdxPair]);

    if (pairData) {
      const { token0, reserves0, reserves1 } = pairData;

      if (token0 && reserves0 && reserves1) {
        const firstIsNdx = NDX_ADDRESS.toLowerCase() === token0.toLowerCase();
        const [firstValue, secondValue] = firstIsNdx
          ? [reserves1, reserves0]
          : [reserves0, reserves1];

        if (firstValue && secondValue) {
          const numberOfEth = convert
            .toBigNumber(firstValue)
            .dividedBy(convert.toBigNumber(secondValue))
            .toNumber();

          return numberOfEth * ethPrice;
        }
      }
    }

    return 0;
  },
  selectFormattedStaking(state: AppState): FormattedStakingDetail {
    const pools = selectors.selectAllStakingPools(state);
    const formattedStaking = pools
      .map((stakingPool) => {
        const indexPool = selectors.selectPool(state, stakingPool.indexPool);

        if (!indexPool) {
          return null;
        }

        const { name, symbol } = indexPool;
        const userData = stakingPool.userData ?? {
          userStakedBalance: "0",
          userRewardsEarned: "0",
        };
        const staked = convert.toBalance(userData.userStakedBalance);
        const earned = convert.toBalance(userData.userRewardsEarned);
        const rate = convert.toBalance(
          convert.toBigNumber(stakingPool.rewardRate).times(86400),
          18
        );

        return {
          id: stakingPool.id,
          isWethPair: stakingPool.isWethPair,
          slug: S(indexPool.name).slugify().s,
          name,
          symbol,
          staked: `${staked} ${symbol}`,
          stakingToken: stakingPool.stakingToken,
          earned: `${earned} NDX`,
          rate: `${rate} NDX/Day`,
        };
      })
      .filter((each): each is FormattedStakingData => Boolean(each));

    return formattedStaking.reduce(
      (prev, next) => {
        const collection = next.isWethPair
          ? prev.liquidityTokens
          : prev.indexTokens;

        collection.push(next);

        return prev;
      },
      {
        indexTokens: [],
        liquidityTokens: [],
      } as FormattedStakingDetail
    );
  },
  selectFormattedPortfolio(
    state: AppState,
    ethPrice: number
  ): FormattedPortfolioData {
    const theme = selectors.selectTheme(state);
    const poolLookup = selectors.selectPoolLookup(state);
    const tokenLookup = selectors.selectTokenLookup(state);
    const tokenBalanceLookup = selectors.selectTokenSymbolsToBalances(state);
    const { staking } = selectors.selectUser(state);
    const ndxBalance = selectors.selectNdxBalance(state);
    const ndxEarned = Object.values(staking).reduce((prev, next) => {
      const { earned } = next;
      const parsed = convert.toBigNumber(earned).toNumber();

      return prev + parsed;
    }, 0);
    const ndxPrice = selectors.selectNdxPrice(state, ethPrice);
    const ndxValue = ndxBalance * ndxPrice;

    let accumulatedValue = ndxValue;
    const accumulatedTokenValues: number[] = [];
    const processedTokens = selectors.selectAllPoolIds(state).map((poolId) => {
      const pool = poolLookup[poolId]!;

      const balanceAsNumber = convert.toBigNumber(
        tokenBalanceLookup[pool.symbol.toLowerCase()]
      );
      const displayedBalance = convert.toBalance(balanceAsNumber);
      const poolToken = tokenLookup[pool.id];
      const poolTokenPrice = poolToken?.priceData?.price ?? 0;
      const value = balanceAsNumber.times(poolTokenPrice).toNumber();
      const displayedValue = convert.toCurrency(value);

      accumulatedTokenValues.push(value);
      accumulatedValue += value;

      return {
        address: pool.id,
        link: `/pools/${S(pool.name).slugify().s}`,
        symbol: pool.symbol,
        name: pool.name,
        balance: displayedBalance,
        staking: staking[pool.id]?.balance ?? "",
        value: displayedValue,
        weight: "0.00%", // Calculate weight after.
      };
    });
    const tokens = processedTokens.map((token, index) => ({
      ...token,
      weight: convert.toPercent(
        accumulatedTokenValues[index] / accumulatedValue
      ),
    }));
    const formattedPortfolio = {
      ndx: {
        address: NDX_ADDRESS,
        image: `indexed-${theme}`,
        symbol: "NDX",
        name: "Indexed",
        balance: `${ndxBalance.toFixed(2)}`,
        value: convert.toCurrency(ndxValue),
        earned: ndxEarned.toFixed(2),
        weight: convert.toPercent(ndxValue / accumulatedValue),
      },
      tokens,
      totalValue: convert.toCurrency(accumulatedValue),
    };

    return formattedPortfolio;
  },
  selectFormattedPairsById: (
    state: AppState,
    ids: string[]
  ): (FormattedPair | undefined)[] => {
    const allPairs = pairsSelectors.selectPairsById(state, ids);
    const allTokens = tokensSelectors.selectEntities(state);
    const formattedPairs: (FormattedPair | undefined)[] = [];

    for (const pair of allPairs) {
      let formattedPair: FormattedPair | undefined;

      if (pair && pair.exists !== undefined && pair.token0 && pair.token1) {
        const token0 = allTokens[pair.token0.toLowerCase()] as NormalizedToken;
        const token1 = allTokens[pair.token1.toLowerCase()] as NormalizedToken;

        formattedPair = {
          id: pair.id,
          exists: pair.exists,
          token0,
          token1,
          reserves0: pair.reserves0 as string,
          reserves1: pair.reserves1 as string,
        };
      }

      formattedPairs.push(formattedPair);
    }

    return formattedPairs;
  },
};

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
export type Transaction = Swap & {
  kind: Trade["kind"] | "swap";
  amount?: Trade["amount"];
};
export type Asset = FormattedIndexPool["assets"][0];

export type FormattedPortfolioDatum = {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  value: string;
  weight: string;
  link?: string;
  staking?: string;
  earned?: string;
};

export interface FormattedPortfolioData {
  tokens: FormattedPortfolioDatum[];
  ndx: FormattedPortfolioDatum;
  totalValue: string;
}

export interface FormattedStakingData {
  id: string;
  slug: string;
  name: string;
  symbol: string;
  staked: string;
  stakingToken: string;
  earned: string;
  rate: string;
  isWethPair: boolean;
}

export interface FormattedStakingDetail {
  indexTokens: FormattedStakingData[];
  liquidityTokens: FormattedStakingData[];
}
