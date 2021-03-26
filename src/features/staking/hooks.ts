import { selectors } from "features";
import { useCallRegistrar } from "hooks";
import { useSelector } from "react-redux";
import type { RegisteredCall } from "features/batcher/slice";

export const stakingCaller = "Staking";

export function createStakingCalls(
  stakingPool: string,
  stakingToken: string
): {
  onChainCalls: RegisteredCall[];
  offChainCalls: RegisteredCall[];
} {
  return {
    onChainCalls: [
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
    ],
    offChainCalls: [],
  };
}

export function useStakingRegistrar() {
  const stakingPools = useSelector(selectors.selectAllStakingPools);
  const { onChainCalls, offChainCalls } = stakingPools.reduce(
    (prev, next) => {
      const poolCalls = createStakingCalls(next.id, next.stakingToken);

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
    caller: stakingCaller,
    onChainCalls,
    offChainCalls,
  });
}
