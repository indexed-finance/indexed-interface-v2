import {
  AppState,
  FormattedPortfolioAsset,
  NormalizedIndexPool,
  selectors,
} from "features";
import { NDX_ADDRESS, SUSHI_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import {
  PricedAsset,
  useToken,
  useTokenLookup,
  useTokenPricesLookup,
} from "./token-hooks";
import {
  computeSushiswapPairAddress,
  computeUniswapPairAddress,
  convert,
  sushiswapInfoPairLink,
  uniswapInfoPairLink,
  uniswapInfoTokenLink,
} from "helpers";
import { useAllPools } from "./pool-hooks";
import {
  useMasterChefInfoLookup,
  useMasterChefPoolsForTokens,
} from "./masterchef-hooks";
import { useMemo } from "react";
import {
  useNewStakingInfoLookup,
  useNewStakingPoolsForTokens,
} from "./new-staking-hooks";
import { usePairExistsLookup } from "./pair-hooks";
import { useSelector } from "react-redux";
import {
  useStakingInfoLookup,
  useStakingPoolsForTokens,
} from "./staking-hooks";
import { useTokenBalances } from "./user-hooks";
import { useVaultPortfolioTotalValue } from "./vault-hooks";
import S from "string";

type RawAsset = {
  id: string;
  name: string;
  symbol: string;
  isUniswapPair?: boolean;
  isSushiswapPair?: boolean;
};

export const buildEthUniPair = (asset: RawAsset) => ({
  id: computeUniswapPairAddress(asset.id, WETH_CONTRACT_ADDRESS).toLowerCase(),
  symbol: `UNIV2:ETH-${asset.symbol}`,
  name: `Uniswap V2: ETH-${asset.symbol}`,
  isUniswapPair: true,
});

export const buildEthSushiPair = (asset: RawAsset) => ({
  id: computeSushiswapPairAddress(
    asset.id,
    WETH_CONTRACT_ADDRESS
  ).toLowerCase(),
  symbol: `SUSHI:ETH-${asset.symbol}`,
  name: `Sushiswap V2: ETH-${asset.symbol}`,
  isSushiswapPair: true,
});

export function usePortfolioTokensAndEthPairs(
  indexPools: NormalizedIndexPool[]
): RawAsset[] {
  return useMemo(() => {
    const baseTokens = [
      ...indexPools.map(({ id, name, symbol }) => ({
        id: id.toLowerCase(),
        name,
        symbol,
      })),
      {
        id: NDX_ADDRESS.toLowerCase(),
        name: "Indexed",
        symbol: "NDX",
      },
    ];
    const pairTokens = baseTokens.reduce(
      (arr, asset) => [
        ...arr,
        buildEthUniPair(asset),
        buildEthSushiPair(asset),
      ],
      [] as RawAsset[]
    );

    return [...baseTokens, ...pairTokens];
  }, [indexPools]);
}

function usePriceLookupArgs(indexPools: NormalizedIndexPool[]): PricedAsset[] {
  return useMemo(() => {
    const ids = [
      ...indexPools.map((p) => p.id.toLowerCase()),
      NDX_ADDRESS.toLowerCase(),
    ];
    return ids.reduce(
      (prev, id) => [
        ...prev,
        { id, useEthLpTokenPrice: false },
        { id, useEthLpTokenPrice: true },
        { id, useEthLpTokenPrice: true, sushiswap: true },
      ],
      [] as PricedAsset[]
    );
  }, [indexPools]);
}

export function useAllPortfolioData() {
  // Common
  const allIndexes = useAllPools();
  const tokenLookup = useTokenLookup();
  const priceLookupArgs = usePriceLookupArgs(allIndexes);
  const priceLookup = useTokenPricesLookup(priceLookupArgs);
  const ndxPrice = priceLookup[NDX_ADDRESS.toLowerCase()];
  const sushiPrice = useToken(SUSHI_ADDRESS)?.priceData?.price ?? 10;

  // Vaults
  const vaultsTotalValue = useVaultPortfolioTotalValue();

  // Indexes
  const tokensAndEthPairs = usePortfolioTokensAndEthPairs(allIndexes);
  const indexIds = useMemo(
    () =>
      tokensAndEthPairs
        .filter(
          ({ isSushiswapPair, isUniswapPair }) =>
            !(isSushiswapPair || isUniswapPair)
        )
        .map(({ id }) => id),
    [tokensAndEthPairs]
  );
  const balances = useTokenBalances(indexIds);
  const indexIdLookup = indexIds.reduce((prev, next) => {
    prev[next] = true;
    return prev;
  }, {} as Record<string, true>);
  const isIndex = (id: string) => Boolean(indexIdLookup[id]);

  // Liquidity
  const liquidityIds = useMemo(() => {
    return tokensAndEthPairs
      .filter(
        ({ isSushiswapPair, isUniswapPair }) => isSushiswapPair || isUniswapPair
      )
      .map(({ id }) => id);
  }, [tokensAndEthPairs]);

  // -- Basic
  const assetIds = indexIds.concat(liquidityIds);
  const stakingPoolsByToken = useStakingPoolsForTokens(assetIds);
  const stakingInfoLookup = useStakingInfoLookup();
  const uniswapStakingInfoLookup = useNewStakingInfoLookup(assetIds);
  const sushiswapStakingInfoLookup = useMasterChefInfoLookup(assetIds);

  // #region Assets
  let earnedNdx = 0;
  let earnedSushi = 0;

  const assetData = indexIds
    .concat(liquidityIds)
    .map((assetId, index) => {
      const returnValue = {
        id: assetId,
        inWallet: {
          amount: 0,
          value: 0,
          symbol: "",
        },
        accrued: {
          amount: 0,
          value: 0,
          symbol: "",
        },
        staking: {
          amount: 0,
          value: 0,
          symbol: "",
        },
      };

      // -- Common
      const token = tokenLookup[assetId];

      if (token) {
        const { symbol, decimals } = token;
        const price = priceLookup[assetId] ?? 0;

        // -- In Wallet
        const walletBalance = balances[index] ?? "0";
        const convertedWalletBalance = convert.toBalanceNumber(
          walletBalance,
          decimals
        );
        const walletValue = convertedWalletBalance * price;

        returnValue.inWallet.amount = convertedWalletBalance;
        returnValue.inWallet.value = walletValue;
        returnValue.inWallet.symbol = symbol;

        // -- Accrued and Staking
        const associatedStakingPool = stakingPoolsByToken[index];
        const [
          associatedStakingUserInfo,
          associatedUniswapStakingUserInfo,
          associatedSushiswapStakingUserInfo,
        ] = [
          associatedStakingPool
            ? stakingInfoLookup[associatedStakingPool.id]
            : undefined,
          uniswapStakingInfoLookup[assetId.toLowerCase()],
          sushiswapStakingInfoLookup[assetId.toLowerCase()],
        ];

        // -- Through us...
        if (associatedStakingUserInfo) {
          const amount = convert.toBalanceNumber(
            associatedStakingUserInfo.earned,
            decimals
          );

          earnedNdx += amount;

          returnValue.accrued.amount += amount;
          returnValue.accrued.symbol = "NDX";

          returnValue.staking.amount += convert.toBalanceNumber(
            associatedStakingUserInfo.balance,
            decimals
          );
          returnValue.staking.symbol = symbol;
        }

        // -- Through Uniswap...
        if (associatedUniswapStakingUserInfo) {
          const amount = associatedUniswapStakingUserInfo?.rewards ?? 0;

          earnedNdx += amount;

          returnValue.accrued.amount += amount;
          returnValue.accrued.symbol = "NDX";
          returnValue.staking.amount +=
            associatedUniswapStakingUserInfo?.balance ?? 0;
        }

        // -- Through Sushiswap...
        if (associatedSushiswapStakingUserInfo) {
          const amount = associatedSushiswapStakingUserInfo?.rewards ?? 0;

          earnedSushi += amount;

          returnValue.accrued.amount += amount;
          returnValue.accrued.symbol = "SUSHI";
          returnValue.staking.amount +=
            associatedSushiswapStakingUserInfo?.balance ?? 0;
        }

        // Calculate values.
        returnValue.staking.value = returnValue.staking.amount * price;

        if (returnValue.accrued.symbol === "NDX") {
          returnValue.accrued.value = returnValue.accrued.amount * ndxPrice;
        } else if (returnValue.accrued.symbol === "SUSHI") {
          returnValue.accrued.value = returnValue.accrued.amount * sushiPrice;
        }

        return returnValue;
      } else {
        return null;
      }
    })
    .filter(Boolean);
  // #endregion

  // #region Total Value
  const totalValue = assetData.reduce(
    (prev, next) => {
      if (next) {
        prev.inWallet += next.inWallet.value;
        prev.accrued += next.accrued.value;
        prev.staking += next.staking.value;
      }

      return prev;
    },
    {
      inWallet: vaultsTotalValue,
      accrued: 0,
      staking: 0,
    }
  );
  const ecosystemTotalValue =
    totalValue.inWallet + totalValue.accrued + totalValue.staking;
  // #endregion

  // #region Governance Token
  const governanceToken = assetData.find(
    (each) => each && each.id.toLowerCase() === NDX_ADDRESS.toLowerCase()
  ) ?? {
    inWallet: {
      amount: 0,
      value: 0,
    },
    staking: {
      amount: 0,
      value: 0,
    },
    accrued: {
      amount: 0,
      value: 0,
    },
  };
  // #endregion

  // #region Percentages
  let indexValue = 0;
  let liquidityValue = 0;
  let ndxValue = 0;

  const indexAssets = [];
  const liquidityAssets = [];

  for (const _asset of assetData) {
    const asset = _asset!; // We filtered with Boolean before.
    const isNdx = asset.id.toLowerCase() === NDX_ADDRESS.toLowerCase();

    if (isNdx) {
      ndxValue += asset.inWallet.value;
      ndxValue += asset.accrued.value;
      ndxValue += asset.staking.value;
    } else if (isIndex(asset.id)) {
      // Index
      indexAssets.push(asset);

      indexValue += asset.inWallet.value;
      indexValue += asset.accrued.value;
      indexValue += asset.staking.value;
    } else {
      // Liquidity
      liquidityAssets.push(asset);

      liquidityValue += asset.inWallet.value;
      liquidityValue += asset.accrued.value;
      liquidityValue += asset.staking.value;
    }
  }

  return {
    totalValue,
    governanceToken,
    earnedRewards: {
      NDX: {
        amount: earnedNdx,
        value: convert.toCurrency(earnedNdx * ndxPrice),
      },
      SUSHI: {
        amount: earnedSushi,
        value: convert.toCurrency(earnedSushi * sushiPrice),
      },
    },
    chart: [
      {
        name: "NDX",
        value: ndxValue / ecosystemTotalValue,
      },
      {
        name: "Vaults",
        value: vaultsTotalValue / ecosystemTotalValue,
      },
      {
        name: "Indexes",
        value: indexValue / ecosystemTotalValue,
      },
      {
        name: "Liquidity",
        value: liquidityValue / ecosystemTotalValue,
      },
    ],
    assets: {
      indexes: indexAssets,
      liquidity: liquidityAssets,
    },
  };
}

export function usePortfolioData({
  onlyOwnedAssets,
}: {
  onlyOwnedAssets: boolean;
}): {
  tokens: FormattedPortfolioAsset[];
  ndx: FormattedPortfolioAsset;
  totalValue: string;
  totalNdxEarned: string;
} {
  const theme = useSelector((state: AppState) => selectors.selectTheme(state));

  const indexPools = useAllPools();
  const assetsRaw = usePortfolioTokensAndEthPairs(indexPools);
  const pairIds = useMemo(() => {
    return assetsRaw
      .filter((a) => a.isSushiswapPair || a.isUniswapPair)
      .map((a) => a.id);
  }, [assetsRaw]);

  const priceLookupArgs = usePriceLookupArgs(indexPools);
  const priceLookup = useTokenPricesLookup(priceLookupArgs);
  const pairExistsLookup = usePairExistsLookup(pairIds);
  const [assets, assetIds] = useMemo(() => {
    const assets = assetsRaw.filter(
      (asset) =>
        pairExistsLookup[asset.id] ||
        !(asset.isUniswapPair || asset.isSushiswapPair)
    );
    const assetIds = assets.map((asset) => asset.id);

    return [assets, assetIds];
  }, [assetsRaw, pairExistsLookup]);

  const balances = useTokenBalances(assetIds);
  const stakingPoolsByTokens = useStakingPoolsForTokens(assetIds);
  const newStakingPoolsByTokens = useNewStakingPoolsForTokens(assetIds);
  const stakingInfoLookup = useStakingInfoLookup();
  const masterChefPools = useMasterChefPoolsForTokens(assetIds);
  const newStakingInfoLookup = useNewStakingInfoLookup(assetIds);
  const masterChefInfoLookup = useMasterChefInfoLookup(assetIds);
  const tokenLookup = useTokenLookup();

  return useMemo(() => {
    let totalNdxEarned = 0;
    let totalValue = 0;

    const portfolioTokens: FormattedPortfolioAsset[] = assets.map(
      ({ name, symbol, id, isUniswapPair, isSushiswapPair }, i) => {
        const stakingPool = stakingPoolsByTokens[i];
        const newStakingPool = newStakingPoolsByTokens[i];
        const masterChefPool = masterChefPools[i];
        const stakingPoolUserInfo = stakingPool
          ? stakingInfoLookup[stakingPool.id.toLowerCase()]
          : undefined;
        const newStakingPoolUserInfo = newStakingInfoLookup[id.toLowerCase()];
        const masterchefUserInfo = masterChefInfoLookup[id.toLowerCase()];
        const decimals = tokenLookup[id]?.decimals ?? 18;

        let ndxEarned = 0;
        let staked = 0;
        let sushiEarned = 0;

        if (stakingPoolUserInfo) {
          const earned = convert.toBalanceNumber(
            stakingPoolUserInfo.earned,
            decimals
          );
          ndxEarned += earned;
          staked += convert.toBalanceNumber(
            stakingPoolUserInfo.balance,
            decimals,
            6
          );
        }

        if (newStakingPoolUserInfo) {
          ndxEarned += newStakingPoolUserInfo.rewards;
          staked += newStakingPoolUserInfo.balance;
        }

        if (masterchefUserInfo) {
          sushiEarned += masterchefUserInfo.rewards;
          staked += masterchefUserInfo.balance;
        }

        totalNdxEarned += ndxEarned;
        const price = priceLookup[id] ?? 0;
        const balance = convert.toBalanceNumber(balances[i] ?? "0", decimals);
        const value = (staked + balance) * price;

        totalValue += value;
        const link = isUniswapPair
          ? uniswapInfoPairLink(id.toLowerCase())
          : isSushiswapPair
          ? sushiswapInfoPairLink(id.toLowerCase())
          : id.toLowerCase() === NDX_ADDRESS.toLowerCase()
          ? uniswapInfoTokenLink(NDX_ADDRESS)
          : `/index-pools/${S(name).slugify().s}`;

        return {
          address: id,
          decimals,
          name,
          symbol,
          link,
          image: symbol,
          isUniswapPair: Boolean(isUniswapPair),
          isSushiswapPair: Boolean(isSushiswapPair),
          hasStakingPool: Boolean(
            stakingPool || newStakingPool || masterChefPool
          ),
          price: price.toFixed(2),
          balance: balance.toFixed(2),
          value: value.toFixed(2),
          weight: "",
          staking: staked > 0 ? staked.toFixed(2) : "",
          ndxEarned: ndxEarned.toFixed(2),
          sushiEarned: sushiEarned.toFixed(2),
        };
      }
    );

    const ndx = portfolioTokens.find(
      (t) => t.address === NDX_ADDRESS.toLowerCase()
    ) as FormattedPortfolioAsset;

    const earnedValue = totalNdxEarned * parseFloat(ndx.price);
    ndx.value = (parseFloat(ndx.value) + earnedValue).toFixed(2);
    ndx.image = `indexed-${theme}`;
    totalValue += earnedValue;
    portfolioTokens.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    portfolioTokens.forEach((token) => {
      token.weight = convert.toPercent(parseFloat(token.value) / totalValue);
      token.value = convert.toCurrency(parseFloat(token.value));
    });

    let tokensToUse = portfolioTokens.filter(
      (t) => t.address !== NDX_ADDRESS.toLowerCase()
    );

    if (onlyOwnedAssets) {
      tokensToUse = tokensToUse.filter((token) => {
        const hasBalance = token.balance !== "0.00";
        const isStaking = token.staking !== "";

        return hasBalance || isStaking;
      });
    }

    return {
      ndx,
      tokens: tokensToUse,
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
    newStakingInfoLookup,
    tokenLookup,
    masterChefInfoLookup,
    masterChefPools,
    newStakingPoolsByTokens,
    onlyOwnedAssets,
  ]);
}
