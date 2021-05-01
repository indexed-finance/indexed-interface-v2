import { AppState, FormattedPortfolioAsset, selectors } from "features";
import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import { computeUniswapPairAddress, convert } from "helpers";
import { useAllPools } from "./pool-hooks";
import { useMemo } from "react";
import { usePairExistsLookup } from "./pair-hooks";
import { useSelector } from "react-redux";
import {
  useStakingInfoLookup,
  useStakingPoolsForTokens,
} from "./staking-hooks";
import { useTokenBalances } from "./user-hooks";
import { useTokenPricesLookup } from "./token-hooks";

export function usePortfolioData(): {
  tokens: FormattedPortfolioAsset[];
  ndx: FormattedPortfolioAsset;
  totalValue: string;
  totalNdxEarned: string;
} {
  const theme = useSelector((state: AppState) => selectors.selectTheme(state));
  const indexPools = useAllPools();
  const [assetsRaw, pairIds, priceLookupArgs] = useMemo(() => {
    const baseTokens = [
      ...indexPools.map(({ id, name, symbol }) => ({
        id: id.toLowerCase(),
        name,
        symbol,
        isUniswapPair: false,
      })),
      {
        id: NDX_ADDRESS.toLowerCase(),
        name: "Indexed",
        symbol: "NDX",
        isUniswapPair: false,
      },
    ];
    const priceLookupArgs = baseTokens.reduce(
      (prev, next) => [
        ...prev,
        {
          id: next.id,
          useEthLpTokenPrice: true,
        },
        {
          id: next.id,
          useEthLpTokenPrice: false,
        },
      ],
      [] as Array<{ id: string; useEthLpTokenPrice: boolean }>
    );
    const pairTokens = baseTokens.map((asset) => {
      return {
        id: computeUniswapPairAddress(
          asset.id,
          WETH_CONTRACT_ADDRESS
        ).toLowerCase(),
        symbol: `UNIV2:ETH-${asset.symbol}`,
        name: `Uniswap V2: ETH-${asset.symbol}`,
        isUniswapPair: true,
      };
    });
    const pairIds = pairTokens.map((p) => p.id);

    return [[...baseTokens, ...pairTokens], pairIds, priceLookupArgs];
  }, [indexPools]);
  const priceLookup = useTokenPricesLookup(priceLookupArgs);
  const pairExistsLookup = usePairExistsLookup(pairIds);
  const [assets, assetIds] = useMemo(() => {
    const assets = assetsRaw.filter(
      (asset) => !asset.isUniswapPair || pairExistsLookup[asset.id]
    );
    const assetIds = assets.map((asset) => asset.id);
    return [assets, assetIds];
  }, [assetsRaw, pairExistsLookup]);

  const balances = useTokenBalances(assetIds);
  const stakingPoolsByTokens = useStakingPoolsForTokens(assetIds);
  const stakingInfoLookup = useStakingInfoLookup();

  return useMemo(() => {
    let totalNdxEarned = 0;
    let totalValue = 0;

    const portfolioTokens: FormattedPortfolioAsset[] = assets.map(
      ({ name, symbol, id, isUniswapPair }, i) => {
        const stakingPool = stakingPoolsByTokens[i];
        const stakingPoolUserInfo = stakingPool
          ? stakingInfoLookup[stakingPool.id]
          : undefined;
        let ndxEarned = 0;
        let staked = 0;
        if (stakingPoolUserInfo) {
          const earned = convert.toBalanceNumber(
            stakingPoolUserInfo.earned,
            18
          );
          ndxEarned = earned;
          staked = convert.toBalanceNumber(stakingPoolUserInfo.balance, 18, 6);
        }
        totalNdxEarned += ndxEarned;
        const price = priceLookup[id] ?? 0;
        const balance = convert.toBalanceNumber(balances[i] ?? "0", 18, 6);
        const value = (staked + balance) * price;

        totalValue += value;

        return {
          address: id,
          name,
          symbol,
          image: symbol,
          isUniswapPair,
          hasStakingPool: Boolean(stakingPool),
          price: price.toFixed(2),
          balance: balance.toFixed(2),
          value: value.toFixed(2),
          weight: "",
          staking: staked > 0 ? staked.toFixed(2) : "",
          ndxEarned: ndxEarned.toFixed(2),
        };
      }
    );

    const ndx = portfolioTokens.find(
      (t) => t.address === NDX_ADDRESS.toLowerCase()
    ) as FormattedPortfolioAsset;

    const earnedValue = totalNdxEarned * +ndx.price;
    ndx.value = (+ndx.value + earnedValue).toFixed(2);
    ndx.image = `indexed-${theme}`;
    totalValue += earnedValue;
    portfolioTokens.sort((a, b) => +b.value - +a.value);
    portfolioTokens.forEach((token) => {
      token.weight = convert.toPercent(parseFloat(token.value) / totalValue);
      token.value = convert.toCurrency(+token.value);
    });
    return {
      ndx,
      tokens: portfolioTokens.filter(
        (t) => t.address !== NDX_ADDRESS.toLowerCase()
      ),
      totalValue: convert.toCurrency(totalValue.toFixed(2)),
      totalNdxEarned: totalNdxEarned.toFixed(2),
    };
  }, [
    assets,
    balances,
    stakingInfoLookup,
    theme,
    stakingPoolsByTokens,
    priceLookup,
  ]);
}
