import { NormalizedIndexPool } from "features";
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
} from "helpers";
import { useAllPools } from "./pool-hooks";
import { useChainId } from "./settings-hooks";
import { useMemo } from "react";
import { useNdxAddress, useSushiAddress } from "./address-hooks";
import { useTokenBalances } from "./user-hooks";

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
      }

      return prev;
    },
    {
      inWallet: 0,
      accrued: 0,
    }
  );
  const ecosystemTotalValue = totalValue.inWallet + totalValue.accrued;
  // #endregion

  // #region Governance Token
  const governanceToken = assetData.find(
    (each) => each && each.id.toLowerCase() === ndxAddress?.toLowerCase()
  ) ?? {
    inWallet: {
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
    } else if (isIndex(asset.id)) {
      // Index
      indexAssets.push(asset);

      indexValue += asset.inWallet.value;
      indexValue += asset.accrued.value;
    } else {
      // Liquidity
      liquidityAssets.push(asset);

      liquidityValue += asset.inWallet.value;
      liquidityValue += asset.accrued.value;
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
