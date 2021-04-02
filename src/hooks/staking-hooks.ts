import { AppState, selectors } from "features";
import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import { convert } from "helpers";
import { sortTokens } from "ethereum";
import { useCallRegistrar } from "./use-call-registrar";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useTokenPrice,
  useTotalSuppliesWithLoadingIndicator,
} from "./token-hooks";
import { useUniswapPairs } from "./pair-hooks";
import { useUserAddress } from "./user-hooks";
import type { NormalizedStakingPool } from "ethereum";
import type { RegisteredCall } from "helpers";

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

export function createStakingCalls(
  stakingPool: string,
  userAddress?: string
): {
  onChainCalls: RegisteredCall[];
  offChainCalls: RegisteredCall[];
} {
  const onChainCalls: RegisteredCall[] = [
    {
      interfaceKind: "StakingRewards_ABI",
      target: stakingPool,
      function: "rewardsDuration",
    },
    {
      interfaceKind: "StakingRewards_ABI",
      target: stakingPool,
      function: "periodFinish",
    },
    {
      interfaceKind: "StakingRewards_ABI",
      target: stakingPool,
      function: "rewardRate",
    },
    {
      interfaceKind: "StakingRewards_ABI",
      target: stakingPool,
      function: "rewardPerToken",
    },
    {
      interfaceKind: "StakingRewards_ABI",
      target: stakingPool,
      function: "totalSupply",
    },
  ];

  if (userAddress) {
    onChainCalls.push(
      {
        interfaceKind: "StakingRewards_ABI",
        target: stakingPool,
        function: "balanceOf",
        args: [userAddress],
      },
      {
        interfaceKind: "StakingRewards_ABI",
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

export function useStakingRegistrar(
  actions: Record<string, any>,
  selectors: Record<string, any>
) {
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
