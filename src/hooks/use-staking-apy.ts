import { AppState, selectors } from "features";
import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import { convert } from "helpers";
import { sortTokens } from "ethereum";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useTokenPrice } from "./use-token-price";
import { useTotalSuppliesWithLoadingIndicator } from "./use-total-supplies";
import { useUniswapPairs } from "./use-uniswap-trading-pairs";

export const useStakingPool = (stakingPoolAddress: string) =>
  useSelector((state: AppState) =>
    selectors.selectStakingPool(state, stakingPoolAddress.toLowerCase())
  );

export function useStakingTokenPrice(stakingPoolAddress: string) {
  const stakingPool = useStakingPool(stakingPoolAddress);
  const [supplyTokens, _pairs] = useMemo(() => {
    if (!stakingPool?.isWethPair) {
      return [[], []];
    }
    const [token0, token1] = sortTokens(
      stakingPool.indexPool,
      WETH_CONTRACT_ADDRESS
    );
    return [
      [stakingPool.stakingToken.toLowerCase()],
      [
        {
          id: stakingPool.stakingToken.toLowerCase(),
          token0,
          token1,
          exists: undefined,
        },
      ],
    ];
  }, [
    stakingPool?.isWethPair,
    stakingPool?.stakingToken,
    stakingPool?.indexPool,
  ]);
  const [supplies, suppliesLoading] = useTotalSuppliesWithLoadingIndicator(
    supplyTokens
  );
  const [pairs, pairsLoading] = useUniswapPairs(_pairs);
  const [tokenPrice, tokenPriceLoading] = useTokenPrice(
    stakingPool?.indexPool ?? ""
  );
  const hasLoaded = useMemo(() => {
    const [_pair] = pairs ?? [];
    const [_supply] = supplies ?? [];
    const wasLoadingIndicated = !(
      pairsLoading ||
      suppliesLoading ||
      tokenPriceLoading
    );

    return stakingPool && !wasLoadingIndicated && Boolean(_pair && _supply);
  }, [
    stakingPool,
    pairs,
    supplies,
    pairsLoading,
    suppliesLoading,
    tokenPriceLoading,
  ]);

  return useMemo(() => {
    if (hasLoaded) {
      if (stakingPool!.isWethPair) {
        const [pair] = pairs!;
        const [supply] = supplies!;
        const firstTokenIsStakingPool =
          pair.token0.address.toLowerCase() ===
          stakingPool!.indexPool.toLowerCase();
        const tokenReserve = firstTokenIsStakingPool
          ? pair.reserve0
          : pair.reserve1;
        const valueOfSupplyInToken = parseFloat(tokenReserve.toExact()) * 2;
        const tokensPerLpToken =
          valueOfSupplyInToken / parseFloat(convert.toBalance(supply, 18));

        return tokensPerLpToken * tokenPrice!;
      } else {
        return tokenPrice;
      }
    } else {
      return null;
    }
  }, [hasLoaded, pairs, stakingPool, supplies, tokenPrice]);
}

export function useStakingApy(stakingPoolAddress: string) {
  const stakingPool = useStakingPool(stakingPoolAddress);
  const [ndxPrice] = useTokenPrice(NDX_ADDRESS);
  const tokenPrice = useStakingTokenPrice(stakingPoolAddress);
  const hasLoaded = ndxPrice && tokenPrice && stakingPool;
  const isWethAddress = stakingPoolAddress === WETH_CONTRACT_ADDRESS;

  if (!isWethAddress && hasLoaded) {
    const isExpired = stakingPool!.periodFinish < Date.now() / 1000;

    if (isExpired) {
      return "Expired";
    } else {
      const ndxMinedPerDay = parseFloat(
        convert.toBalance(
          convert.toBigNumber(stakingPool!.rewardRate ?? "0").times(86400),
          18
        )
      );
      const valueNdxPerYear = ndxMinedPerDay * 365 * ndxPrice!;
      const totalStakedValue = convert
        .toBigNumber(tokenPrice!.toString())
        .toNumber();
      const formatted = (valueNdxPerYear / totalStakedValue) * 100;

      return convert.toPercent(formatted);
    }
  } else {
    return null;
  }
}
