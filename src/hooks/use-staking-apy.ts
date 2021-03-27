import { AppState, selectors } from "features";
import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import { Pair } from "@uniswap/sdk"
import { computeUniswapPairAddress, sortTokens } from "ethereum";
import { convert } from "helpers";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useTokenPrice } from "./use-token-price";
import { useTotalSuppliesWithLoadingIndicator } from "./use-total-supplies";
import { useUniswapPairs } from "./use-uniswap-trading-pairs";

export const useStakingPool = (stakingPoolAddress: string) => useSelector((state: AppState) => selectors.selectStakingPool(state, stakingPoolAddress.toLowerCase()));

export function useStakingTokenPrice(stakingPoolAddress: string) {
  const stakingPool = useStakingPool(stakingPoolAddress);
  const [ supplyTokens, _pairs ] = useMemo(() => {
    if (!stakingPool?.isWethPair) {
      return [[], []];
    }
    const [token0, token1] = sortTokens(stakingPool.indexPool, WETH_CONTRACT_ADDRESS);
    console.log('Right Pair Address ? ', computeUniswapPairAddress(token0, token1).toLowerCase() === stakingPool.stakingToken.toLowerCase())
    return [
      [stakingPool.stakingToken.toLowerCase()],
      [{
        id: stakingPool.stakingToken.toLowerCase(),
        token0,
        token1,
        exists: undefined
      }]
    ];
  }, [ stakingPool?.isWethPair, stakingPool?.stakingToken, stakingPool?.indexPool ]);
  const [supplies, suppliesLoading] = useTotalSuppliesWithLoadingIndicator(supplyTokens);
  const [pairs, pairsLoading] = useUniswapPairs(_pairs);
  const [tokenPrice, tokenPriceLoading] = useTokenPrice(stakingPool?.isWethPair ? stakingPool.indexPool : stakingPool?.stakingToken ?? "");

  // console.log(`Got Token Price?: ${tokenPrice}`);

  return useMemo(() => {
    if (!stakingPool || tokenPriceLoading) return null;
    if (stakingPool.isWethPair) {
      console.log(`Is WETH Pair :D || ${pairsLoading} | ${suppliesLoading}`);
      console.log(`Pairs: ${JSON.stringify(_pairs)}`)
      if (pairsLoading || suppliesLoading) {
        return null;
      }
      const [pair] = pairs as Pair[];
      const [supply] = supplies as string[];
      const tokenReserve = pair.token0.address.toLowerCase() === stakingPool.indexPool.toLowerCase() ? pair.reserve0 : pair.reserve1;
      const valueOfSupplyInToken = parseFloat(tokenReserve.toExact()) * 2;
      const tokensPerLpToken = valueOfSupplyInToken / parseFloat(convert.toBalance(supply, 18));
      return tokensPerLpToken * (tokenPrice as number);
    } else {
      return tokenPrice;
    }
  }, [supplies, suppliesLoading, pairs, pairsLoading, stakingPool, tokenPrice, tokenPriceLoading ])
}

export function useStakingApy(stakingPoolAddress: string) {
  const stakingPool = useStakingPool(stakingPoolAddress);
  const [ndxPrice,] = useTokenPrice(NDX_ADDRESS);
  const tokenPrice = useStakingTokenPrice(stakingPoolAddress);
  // If we don't have the requisite data, return null
  if (!(ndxPrice && tokenPrice && stakingPool)) {
    return null;
  }
  if (stakingPool.periodFinish < Date.now() / 1000) return "0%";
  const ndxMinedPerDay = parseFloat(
    convert.toBalance(
      convert.toBigNumber(stakingPool?.rewardRate ?? "0").times(86400),
      18
    )
  );
  const valueNdxPerYear = ndxMinedPerDay * 365 * ndxPrice;
  const totalStakedValue = convert
    .toBigNumber(tokenPrice.toString())
    .toNumber();
  const formatted = (valueNdxPerYear / totalStakedValue) * 100;
  return convert.toPercent(formatted);
}