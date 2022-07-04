import { FormattedPortfolioAsset, NormalizedIndexPool } from "features";
import {
  PricedAsset,
  useToken,
  useTokenLookup,
  useTokenPricesLookup,
} from "./token-hooks";
import { WETH_ADDRESS } from "config";
import {
  computeSushiswapPairAddress,
  computeUniswapPairAddress,
  convert,
  sushiswapInfoPairLink,
  uniswapInfoPairLink,
  uniswapInfoTokenLink,
} from "helpers";
import { useAllPools } from "./pool-hooks";
import { useChainId, useTheme } from "./settings-hooks";
import { useMemo } from "react";
import { useNdxAddress, useSushiAddress } from "./address-hooks";
import { usePairExistsLookup } from "./pair-hooks";
import { useTokenBalances } from "./user-hooks";
import S from "string";

type RawAsset = {
  id: string;
  name: string;
  symbol: string;
  isUniswapPair?: boolean;
  isSushiswapPair?: boolean;
};

export const buildEthUniPair = (asset: RawAsset, chainId: number) => ({
  id: computeUniswapPairAddress(
    asset.id,
    WETH_ADDRESS[chainId],
    chainId
  ).toLowerCase(),
  symbol: `UNIV2:ETH-${asset.symbol}`,
  name: `Uniswap V2: ETH-${asset.symbol}`,
  isUniswapPair: true,
});

export const buildEthSushiPair = (asset: RawAsset, chainId: number) => ({
  id: computeSushiswapPairAddress(
    asset.id,
    WETH_ADDRESS[chainId],
    chainId
  ).toLowerCase(),
  symbol: `SUSHI:ETH-${asset.symbol}`,
  name: `Sushiswap V2: ETH-${asset.symbol}`,
  isSushiswapPair: true,
});

export function usePortfolioTokensAndEthPairs(
  indexPools: NormalizedIndexPool[]
): RawAsset[] {
  const chainId = useChainId();
  const ndxAddress = useNdxAddress();
  return useMemo(() => {
    const baseTokens = [
      ...indexPools.map(({ id, name, symbol }) => ({
        id: id.toLowerCase(),
        name,
        symbol,
      })),
    ];
    if (ndxAddress) {
      baseTokens.push({
        id: ndxAddress.toLowerCase(),
        name: "Indexed",
        symbol: "NDX",
      });
    }
    const pairTokens = baseTokens.reduce(
      (arr, asset) => [
        ...arr,
        buildEthUniPair(asset, chainId),
        buildEthSushiPair(asset, chainId),
      ],
      [] as RawAsset[]
    );

    return [...baseTokens, ...pairTokens];
  }, [indexPools, ndxAddress, chainId]);
}

function usePriceLookupArgs(indexPools: NormalizedIndexPool[]): PricedAsset[] {
  const ndxAddress = useNdxAddress();
  return useMemo(() => {
    const ids = indexPools.map((p) => p.id.toLowerCase());
    if (ndxAddress) {
      ids.push(ndxAddress.toLowerCase());
    }
    return ids.reduce(
      (prev, id) => [
        ...prev,
        { id, useEthLpTokenPrice: false },
        { id, useEthLpTokenPrice: true },
        { id, useEthLpTokenPrice: true, sushiswap: true },
      ],
      [] as PricedAsset[]
    );
  }, [indexPools, ndxAddress]);
}

export function useAllPortfolioData() {
  // Common
  const ndxAddress = useNdxAddress();
  const sushiAddress = useSushiAddress();
  const allIndexes = useAllPools();
  const tokenLookup = useTokenLookup();
  const priceLookupArgs = usePriceLookupArgs(allIndexes);
  const priceLookup = useTokenPricesLookup(priceLookupArgs);
  const ndxPrice = priceLookup[ndxAddress?.toLowerCase() ?? ""] ?? 0;
  const sushiPrice = useToken(sushiAddress)?.priceData?.price ?? 10;

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
  // #region Assets

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
      inWallet: 0,
      accrued: 0,
      staking: 0,
    }
  );
  const ecosystemTotalValue =
    totalValue.inWallet + totalValue.accrued + totalValue.staking;
  // #endregion

  // #region Governance Token
  const governanceToken = assetData.find(
    (each) => each && each.id.toLowerCase() === ndxAddress?.toLowerCase()
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
    const isNdx = asset.id.toLowerCase() === ndxAddress?.toLowerCase();

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
    earnedRewards: {},
    chart: [
      {
        name: "NDX",
        value: ndxValue / ecosystemTotalValue,
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
  const theme = useTheme();
  const ndxAddress = useNdxAddress() ?? "";
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
  const tokenLookup = useTokenLookup();

  return useMemo(() => {
    let totalNdxEarned = 0;
    let totalValue = 0;

    const portfolioTokens: FormattedPortfolioAsset[] = assets.map(
      ({ name, symbol, id, isUniswapPair, isSushiswapPair }, i) => {
        const decimals = tokenLookup[id]?.decimals ?? 18;

        const ndxEarned = 0;

        totalNdxEarned += ndxEarned;
        const price = priceLookup[id] ?? 0;
        const balance = convert.toBalanceNumber(balances[i] ?? "0", decimals);
        const value = balance * price;

        totalValue += value;
        const link = isUniswapPair
          ? uniswapInfoPairLink(id.toLowerCase())
          : isSushiswapPair
          ? sushiswapInfoPairLink(id.toLowerCase())
          : id.toLowerCase() === ndxAddress?.toLowerCase()
          ? uniswapInfoTokenLink(ndxAddress)
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
          hasStakingPool: false,
          price: price.toFixed(2),
          balance: balance.toFixed(2),
          value: value.toFixed(2),
          weight: "",
          ndxEarned: ndxEarned.toFixed(2),
        };
      }
    );

    const ndx = portfolioTokens.find(
      (t) => t.address === ndxAddress.toLowerCase()
    ) as FormattedPortfolioAsset;
    if (ndx) {
      const earnedValue = totalNdxEarned * parseFloat(ndx.price);
      ndx.value = (parseFloat(ndx.value) + earnedValue).toFixed(2);
      ndx.image = `indexed-${theme}`;
      totalValue += earnedValue;
    }
    portfolioTokens.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    portfolioTokens.forEach((token) => {
      token.weight = convert.toPercent(parseFloat(token.value) / totalValue);
      token.value = convert.toCurrency(parseFloat(token.value));
    });

    let tokensToUse = portfolioTokens.filter(
      (t) => t.address !== ndxAddress.toLowerCase()
    );

    if (onlyOwnedAssets) {
      tokensToUse = tokensToUse.filter((token) => {
        const hasBalance = token.balance !== "0.00";
        return hasBalance;
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
    theme,
    priceLookup,
    tokenLookup,
    onlyOwnedAssets,
    ndxAddress,
  ]);
}
