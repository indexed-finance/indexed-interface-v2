import { AppState, selectors } from "features";
import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import { convert, sortTokens } from "helpers";
import { useCallRegistrar } from "./use-call-registrar";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useTokenPrice,
  useTotalSuppliesWithLoadingIndicator,
} from "./token-hooks";
import { useUniswapPairs } from "./pair-hooks";
import { useUserAddress } from "./user-hooks";
import type { NormalizedStakingPool } from "features";
import type { RegisteredCall } from "helpers";

export const useStakingPool = (stakingPoolAddress: string) =>
  useSelector((state: AppState) =>
    selectors.selectStakingPool(state, stakingPoolAddress.toLowerCase())
  );

export const useStakingInfoLookup = () =>
  useSelector((state: AppState) => selectors.selectStakingInfoLookup(state));

export const useStakingPoolsForTokens = (stakingTokens: string[]) =>
  useSelector((state: AppState) =>
    selectors.selectStakingPoolsByStakingTokens(state, stakingTokens)
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
          exists: true,
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
    if (!stakingPool) return false;
    if (stakingPool!.isWethPair) {
      return !(pairsLoading || suppliesLoading || tokenPriceLoading);
    }
    return !tokenPriceLoading;
  }, [stakingPool, pairsLoading, suppliesLoading, tokenPriceLoading]);

  return useMemo(() => {
    if (hasLoaded) {
      if (stakingPool!.isWethPair) {
        const [pair] = pairs || [];
        const [supply] = supplies || [];
        const firstTokenIsStakingPool =
          pair.token0.address.toLowerCase() ===
          stakingPool!.indexPool.toLowerCase();
        const tokenReserve = firstTokenIsStakingPool
          ? pair.reserve0
          : pair.reserve1;
        const valueOfSupplyInToken = parseFloat(tokenReserve.toExact()) * 2;
        const tokensPerLpToken =
          valueOfSupplyInToken /
          parseFloat(convert.toBalance(supply, 18, false));
        return tokensPerLpToken * (tokenPrice as number);
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

  return useMemo(() => {
    const hasLoaded = ndxPrice && tokenPrice && stakingPool;
    const isWethAddress = stakingPoolAddress === WETH_CONTRACT_ADDRESS;

    if (!isWethAddress && hasLoaded) {
      const isExpired = stakingPool!.periodFinish < Date.now() / 1000;

      if (isExpired) {
        return "Expired";
      } else {
        const ndxMinedPerDay = convert
          .toBigNumber(stakingPool?.rewardRate ?? "0")
          .times(86400);
        const valueNdxPerYear = parseFloat(
          convert.toBalance(
            ndxMinedPerDay.times(365).times(ndxPrice ?? 0),
            18,
            false
          )
        );
        const stakedAmount = parseFloat(
          convert.toBalance(stakingPool?.totalSupply ?? "0", 18)
        );
        const totalStakedValue = stakedAmount * (tokenPrice ?? 0);
        return convert.toPercent(valueNdxPerYear / totalStakedValue);
      }
    } else {
      return null;
    }
  }, [tokenPrice, ndxPrice, stakingPool, stakingPoolAddress]);
}

export function createStakingCalls(
  stakingPool: string,
  userAddress?: string
): {
  onChainCalls: RegisteredCall[];
  offChainCalls: RegisteredCall[];
} {
  const onChainCalls: RegisteredCall[] = [
    {
      interfaceKind: "StakingRewards",
      target: stakingPool,
      function: "rewardsDuration",
    },
    {
      interfaceKind: "StakingRewards",
      target: stakingPool,
      function: "periodFinish",
    },
    {
      interfaceKind: "StakingRewards",
      target: stakingPool,
      function: "rewardRate",
    },
    {
      interfaceKind: "StakingRewards",
      target: stakingPool,
      function: "rewardPerToken",
    },
    {
      interfaceKind: "StakingRewards",
      target: stakingPool,
      function: "totalSupply",
    },
  ];

  if (userAddress) {
    onChainCalls.push(
      {
        interfaceKind: "StakingRewards",
        target: stakingPool,
        function: "balanceOf",
        args: [userAddress],
      },
      {
        interfaceKind: "StakingRewards",
        target: stakingPool,
        function: "earned",
        args: [userAddress],
      }
    );
  }

  return {
    onChainCalls,
    offChainCalls: [],
  };
}

export const STAKING_CALLER = "Staking";

export function useStakingRegistrar() {
  const userAddress = useUserAddress();
  const stakingPools: NormalizedStakingPool[] = useSelector(
    selectors.selectAllStakingPools
  );
  const { onChainCalls, offChainCalls } = stakingPools.reduce(
    (prev, next) => {
      const poolCalls = createStakingCalls(next.id, userAddress);

      prev.onChainCalls.push(...poolCalls.onChainCalls);
      prev.offChainCalls.push(...poolCalls.offChainCalls);

      return prev;
    },
    {
      onChainCalls: [],
      offChainCalls: [],
    } as {
      onChainCalls: RegisteredCall[];
      offChainCalls: RegisteredCall[];
    }
  );

  useCallRegistrar({
    caller: STAKING_CALLER,
    onChainCalls,
    offChainCalls,
  });
}
