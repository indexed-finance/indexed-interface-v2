import { FormattedCategory, categoriesSelectors } from "./categories";
import {
  FormattedIndexPool,
  NormalizedIndexPool,
  formatPoolAsset,
  indexPoolsSelectors,
} from "./indexPools";
import { FormattedPair, pairsSelectors } from "./pairs";
import { FormattedPortfolioData, userSelectors } from "./user";
import { MasterChefPool, masterChefSelectors } from "./masterChef";
import { NDX_ADDRESS, WETH_ADDRESS } from "config";
import { NormalizedToken, tokensSelectors } from "./tokens";
import { NormalizedTransaction, transactionsSelectors } from "./transactions";
import { batcherSelectors } from "./batcher";
import { computeSushiswapPairAddress, convert } from "helpers";
import { createSelector } from "reselect";
import { dailySnapshotsSelectors } from "./dailySnapshots";
import { formatDistance } from "date-fns";
import { settingsSelectors } from "./settings";
import { sortTokens } from "@indexed-finance/indexed.js/dist/utils/address";
import { timelocksSelectors } from "./timelocks";
import S from "string";
import type { AppState } from "./store";

const MILLISECONDS_PER_SECOND = 1000;

export const selectors = {
  ...batcherSelectors,
  ...categoriesSelectors,
  ...dailySnapshotsSelectors,
  ...indexPoolsSelectors,
  ...settingsSelectors,
  ...timelocksSelectors,
  ...tokensSelectors,
  ...userSelectors,
  ...pairsSelectors,
  ...transactionsSelectors,
  ...masterChefSelectors,
  // Categories
  selectFormattedCategory: (
    state: AppState,
    categoryName: string
  ): null | FormattedCategory => {
    const category = selectors.selectCategoryByName(state, categoryName);
    const indexPoolLookup = selectors.selectPoolLookup(state);

    return category
      ? {
          id: category.id,
          symbol: category.symbol,
          name: category.name,
          slug: S(category.name).slugify().s,
          brief: category.brief,
          description: category.description,
          indexPools: category.indexPools
            .map((id) => indexPoolLookup[id])
            .filter((each): each is NormalizedIndexPool => Boolean(each))
            .map((pool) => {
              const swapFee = selectors.selectFormattedSwapFee(state, pool.id);
              const price = convert.toToken(
                convert
                  .toBigNumber(pool.totalValueLockedUSD)
                  .dividedBy(convert.toBigNumber(pool.totalSupply))
              );

              return {
                id: pool.id,
                name: pool.name,
                slug: S(pool.name).slugify().s,
                symbol: pool.symbol,
                size: pool.size.toString(),
                price: convert.toCurrency(price.toNumber()),
                supply: convert.toComma(
                  parseFloat(convert.toBalance(pool.totalSupply))
                ),
                marketCap: convert.toCurrency(pool.totalValueLockedUSD),
                swapFee,
                cumulativeFees: convert.toCurrency(pool.feesTotalUSD),
                volume: convert.toCurrency(pool.totalVolumeUSD),
              };
            }),
          tokens: category.tokens.ids.map((id) => category.tokens.entities[id]),
        }
      : null;
  },
  selectAllFormattedCategories: (state: AppState): FormattedCategory[] => {
    return selectors
      .selectAllCategories(state)
      .map((category) =>
        selectors.selectFormattedCategory(state, category.name)
      )
      .filter((each): each is FormattedCategory => Boolean(each));
  },
  // Index Pools
  selectFormattedIndexPool: createSelector(
    [
      indexPoolsSelectors.selectPool,
      tokensSelectors.selectTokenLookup,
      dailySnapshotsSelectors.selectPoolStats,
    ],
    (pool, tokens, stats) => {
      const tokenIds = pool?.tokens.ids ?? [];
      const totalValueLocked =
        pool?.tokensList.reduce((total, tokenId) => {
          if (total === undefined) return undefined;

          const token = tokens[tokenId];
          if (token) {
            const price = token.priceData?.price;
            if (price) {
              const balance = convert.toBigNumber(
                pool.tokens.entities[tokenId].balance
              );
              const value = convert.toBalanceNumber(
                balance.times(price),
                token.decimals
              );
              return total + value;
            }
          }
          return undefined;
        }, 0) ?? pool?.totalValueLockedUSD;

      return pool && pool.symbol !== "ERROR"
        ? ({
            chainId: pool.chainId,
            category: pool.category.id,
            canStake: false,
            id: pool.id,
            symbol: pool.symbol,
            priceUsd: stats ? convert.toCurrency(stats.price) : "",
            netChange: stats?.deltas
              ? convert.toCurrency(stats.deltas.price.day.value, {
                  signDisplay: "always",
                })
              : "",
            netChangePercent: stats?.deltas
              ? convert.toPercent(stats.deltas.price.day.percent, {
                  signDisplay: "always",
                })
              : "",
            isNegative: stats?.deltas && stats.deltas.price.day.value < 0,
            name: pool.name,
            slug: `/index-pools/${S(pool.name).slugify().s}`,
            volume: stats?.deltas
              ? convert.toCurrency(stats.deltas.volume.day)
              : "",
            totalValueLocked:
              /* convert.toCurrency(pool?.totalValueLockedUSD),//  */ convert.toCurrency(
                totalValueLocked
              ),
            totalValueLockedPercent: stats?.deltas
              ? convert.toPercent(stats.deltas.totalValueLockedUSD.day.percent)
              : "",
            swapFee: convert.toPercent(
              parseFloat(convert.toBalance(pool.swapFee))
            ),
            cumulativeFee: convert.toCurrency(pool.feesTotalUSD),
            transactions: {
              swaps: (pool.transactions.swaps ?? []).map((swap) => {
                const from = tokens[swap.tokenIn.toLowerCase()]?.symbol;
                const to = tokens[swap.tokenOut.toLowerCase()]?.symbol;
                const [transactionHash] = swap.id.split("-");

                return {
                  when: formatDistance(
                    new Date(swap.timestamp * MILLISECONDS_PER_SECOND),
                    new Date(),
                    {
                      addSuffix: true,
                    }
                  ),
                  from,
                  to,
                  fromAddress: swap.tokenIn.toLowerCase(),
                  toAddress: swap.tokenOut.toLowerCase(),
                  transactionHash,
                };
              }),
              trades: (pool.transactions.trades ?? []).map((trade) => {
                const zeroForOne = +trade.amount0In > 0;
                const { token0, token1 } = trade.pair;
                const [tokenIn, tokenOut] = zeroForOne
                  ? [token0, token1]
                  : [token1, token0];
                return {
                  when: formatDistance(
                    new Date(trade.timestamp * MILLISECONDS_PER_SECOND),
                    new Date(),
                    {
                      addSuffix: true,
                    }
                  ),
                  from: tokenIn.symbol,
                  to: tokenOut.symbol,
                  fromAddress: tokenIn.id.toLowerCase(),
                  toAddress: tokenOut.id.toLowerCase(),
                  amount: convert.toCurrency(trade.amountUSD),
                  kind:
                    tokenIn.symbol.toLowerCase() === pool.symbol.toLowerCase()
                      ? "sell"
                      : "buy",
                  transactionHash: trade.transaction.id,
                };
              }),
            },
            assets: tokenIds
              .map((poolTokenId) => formatPoolAsset(tokens[poolTokenId], pool))
              .sort(
                (left, right) =>
                  parseFloat(right.weightPercentage) -
                  parseFloat(left.weightPercentage)
              ),
          } as FormattedIndexPool)
        : null;
    }
  ),
  selectAllFormattedIndexPools: (state: AppState) => {
    return selectors
      .selectAllPools(state)
      .map((pool) => selectors.selectFormattedIndexPool(state, pool.id))
      .filter((each): each is FormattedIndexPool => Boolean(each))
      .filter((each) => !["FFF", "CC10", "DEFI5"].includes(each.symbol))
      .filter((each) => each.chainId === state.settings.network)
      .sort((a, b) => {
        const aValue = a.totalValueLocked.replace(/\$/g, "").replace(/,/g, "");
        const bValue = b.totalValueLocked.replace(/\$/g, "").replace(/,/g, "");

        return parseFloat(bValue) - parseFloat(aValue);
      });
  },
  selectPossibleMasterChefPairs(state: AppState) {
    const indexPoolIds = selectors.selectAllPoolIds(state);
    const chainId = selectors.selectNetwork(state);
    const ndxAddress = NDX_ADDRESS[chainId];
    const wethAddress = WETH_ADDRESS[chainId];
    if (!ndxAddress || !wethAddress) {
      return [];
    }
    return [...indexPoolIds, ndxAddress].map((token) => {
      const [token0, token1] = sortTokens(token, wethAddress);
      return {
        id: computeSushiswapPairAddress(token0, token1, chainId).toLowerCase(),
        token0: token0.toLowerCase(),
        token1: token1.toLowerCase(),
        sushiswap: true,
        exists: undefined,
      };
    });
  },
  selectMasterChefPoolsWithRecognizedPairs(state: AppState): MasterChefPool[] {
    const pairIds = selectors
      .selectPossibleMasterChefPairs(state)
      .map((p) => p.id);
    const pools = selectors.selectMasterChefPoolsByStakingTokens(
      state,
      pairIds
    );
    return pools.filter((_) => Boolean(_)) as MasterChefPool[];
  },
  // User
  selectFormattedPortfolio(
    state: AppState,
    ethPrice: number
  ): FormattedPortfolioData {
    const theme = selectors.selectTheme(state);
    const chainId = selectors.selectNetwork(state);
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
        link: `/index-pools/${S(pool.name).slugify().s}`,
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
    const formattedPortfolio: FormattedPortfolioData = {
      tokens,
      totalValue: convert.toCurrency(accumulatedValue),
    };
    const ndxAddress = NDX_ADDRESS[chainId];
    if (ndxAddress) {
      formattedPortfolio.ndx = {
        address: ndxAddress,
        image: `indexed-${theme}`,
        symbol: "NDX",
        name: "Indexed",
        balance: `${ndxBalance.toFixed(2)}`,
        value: convert.toCurrency(ndxValue),
        earned: ndxEarned.toFixed(2),
        weight: convert.toPercent(ndxValue / accumulatedValue),
      };
    }

    return formattedPortfolio;
  },
  // Pairs
  selectFormattedPairsById: (
    state: AppState,
    ids: string[]
  ): (FormattedPair | undefined)[] => {
    const allPairs = selectors.selectPairsById(state, ids);
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
          sushiswap: pair.sushiswap,
        };
      }

      formattedPairs.push(formattedPair);
    }

    return formattedPairs;
  },
  selectUserTransactions: (state: AppState): NormalizedTransaction[] => {
    const user = selectors.selectUserAddress(state);
    if (!user) return [];
    const transactions = selectors.selectTransactions(state);
    return transactions.filter(
      (t) => t.from.toLowerCase() === user.toLowerCase()
    );
  },
  selectTotalAssetsUnderManagement: (state: AppState) =>
    convert.toCurrency(
      selectors
        .selectAllFormattedIndexPools(state)
        .map((pool) =>
          parseFloat(pool.totalValueLocked.replace(/\$/g, "").replace(/,/g, ""))
        )
        .reduce((prev, next) => prev + next, 0)
    ),
};
