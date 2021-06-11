import { AppState, selectors } from "features";
import { MASTER_CHEF_ADDRESS, NDX_ADDRESS, SUSHI_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import { MasterChefPool, masterChefCaller, totalSushiPerDay } from "features/masterChef";
import { RegisteredCall, computeSushiswapPairAddress, convert, sortTokens } from "helpers";
import { buildEthSushiPair } from "./portfolio-hooks";
import { useAllPoolIds, useAllPools } from "./pool-hooks";
import { useCachedValue } from "./use-debounce";
import { useCallRegistrar } from "./use-call-registrar";
import { useMemo } from "react";
import { usePair, useUniswapPairs } from "./pair-hooks";
import { usePairTokenPrice, useTokenPrice, useTokenPricesLookup, useTotalSuppliesWithLoadingIndicator } from "./token-hooks";
import { useSelector } from "react-redux";
import { useUserAddress } from "./user-hooks";

export const useMasterChefStakedBalance = (id: string) =>
  useSelector((state: AppState) =>
    selectors.selectMasterChefUserStakedBalance(state, id)
  );

export const useMasterChefPoolForToken = (stakingToken: string) =>
  useSelector((state: AppState) =>
    selectors.selectMasterChefPoolByStakingToken(state, stakingToken)
  );

export const useMasterChefPoolsForTokens = (stakingTokens: string[]) =>
  useSelector((state: AppState) =>
    selectors.selectMasterChefPoolsByStakingTokens(state, stakingTokens)
  );

export const useMasterChefMeta = () => useSelector(selectors.selectMasterChefMeta);

export const useMasterChefPool = (id: string) => useSelector(
  (state: AppState) => selectors.selectMasterChefPool(state, id)
);

export const useMasterChefRewardsPerDay = (id: string) => {
  const meta = useMasterChefMeta();
  const pool = useMasterChefPool(id);
  if (!pool) return "0";
  return totalSushiPerDay.times(pool.allocPoint).div(meta.totalAllocPoint);
}

export const useMasterChefInfoLookup = (ids: string[]) =>
  useSelector((state: AppState) =>
    selectors.selectMasterChefInfoLookup(state, ids)
  );


export function useMasterChefApy(pid: string) {
  const meta = useSelector((state: AppState) => selectors.selectMasterChefMeta(state));
  const stakingPool = useMasterChefPool(pid);
  const [sushiPrice] = useTokenPrice(SUSHI_ADDRESS);
  // console.log(`GOT SUSHI PRICE? ${sushiPrice}`)
  const tokenPrice = usePairTokenPrice(stakingPool?.token ?? "")

  return useMemo(() => {
    console.log(`SUSHI PRICE ${sushiPrice} | Token Price ${tokenPrice}`)
    const hasLoaded = sushiPrice && tokenPrice;

    if (hasLoaded && stakingPool) {
      const sushiMinedPerDay = totalSushiPerDay.times(stakingPool.allocPoint).div(meta.totalAllocPoint);
      const valueSushiPerYear = parseFloat(
        convert.toBalance(
          sushiMinedPerDay.times(365).times(sushiPrice ?? 0),
          18,
          false
        )
      );
      const stakedAmount = parseFloat(
        convert.toBalance(stakingPool?.totalStaked ?? "0", 18)
      );
      const totalStakedValue = stakedAmount * (tokenPrice ?? 0);
      return convert.toPercent(valueSushiPerYear / totalStakedValue);
    } else {
      return null;
    }
  }, [tokenPrice, sushiPrice, stakingPool, meta.totalAllocPoint]);
}

export function createMasterChefCalls(
  pid: string,
  stakingToken: string,
  userAddress?: string
): RegisteredCall[] {
  const onChainCalls: RegisteredCall[] = [
    {
      interfaceKind: "IERC20",
      target: stakingToken,
      function: "balanceOf",
      args: [MASTER_CHEF_ADDRESS],
    },
    {

      interfaceKind: "MasterChef",
      target: MASTER_CHEF_ADDRESS,
      function: "poolInfo",
      args: [pid]
    }
  ];


  if (userAddress) {
    onChainCalls.push(
      {
        interfaceKind: "MasterChef",
        target: MASTER_CHEF_ADDRESS,
        function: "userInfo",
        args: [pid, userAddress],
      },
      {
        interfaceKind: "MasterChef",
        target: MASTER_CHEF_ADDRESS,
        function: "pendingSushi",
        args: [pid, userAddress],
      }
    );
  }
  return onChainCalls;
}

export const useMasterChefPoolsWithRecognizedPairs = () => {
  const allPairs = useSelector(selectors.selectPossibleMasterChefPairs);
  const debouncedPairs = useCachedValue(allPairs);
  useUniswapPairs(debouncedPairs);
  const pairIds = useMemo(() => {
    return debouncedPairs.map(p => p.id);
  }, [debouncedPairs])
  const pools = useSelector((state: AppState) => selectors.selectMasterChefPoolsByStakingTokens(state, pairIds));
  return useMemo(() => {
    return pools.filter(_ => Boolean(_)) as MasterChefPool[];
  }, [pools])
}

export function useMasterChefRegistrar() {
  const userAddress = useUserAddress();
  const stakingPools: MasterChefPool[] = useMasterChefPoolsWithRecognizedPairs();
  const { onChainCalls, offChainCalls } = useMemo(() => {
    return stakingPools.reduce(
      (prev, next) => {
        const poolCalls = createMasterChefCalls(
          next.id,
          next.token,
          userAddress
        );
        prev.onChainCalls.push(...poolCalls);
        return prev;
      },
      {
        onChainCalls: [
          {
            interfaceKind: "MasterChef",
            target: MASTER_CHEF_ADDRESS,
            function: "totalAllocPoint",
          },
        ],
        offChainCalls: [],
      } as {
        onChainCalls: RegisteredCall[];
        offChainCalls: RegisteredCall[];
      }
    );
  }, [stakingPools, userAddress]);

  useCallRegistrar({
    caller: masterChefCaller,
    onChainCalls,
    offChainCalls,
  });
}