import { selectors } from "features";
import { useCallRegistrar } from "hooks";
import { useSelector } from "react-redux";
import type { RegisteredCall } from "features/batcher/slice";

export const stakingCaller = "Staking";

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

export function useStakingRegistrar(userAddress?: string) {
  const stakingPools = useSelector(selectors.selectAllStakingPools);
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
    caller: stakingCaller,
    onChainCalls,
    offChainCalls,
  });
}
