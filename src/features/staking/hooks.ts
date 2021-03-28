import { stakingCaller } from "./slice";
import { useSelector } from "react-redux";
import { useUserAddress } from "features/user/hooks";
import useCallRegistrar from "hooks/use-call-registrar";
import type { NormalizedStakingPool } from "ethereum";
import type { RegisteredCall } from "helpers";

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

  useCallRegistrar(
    {
      caller: stakingCaller,
      onChainCalls,
      offChainCalls,
    },
    actions,
    selectors
  );
}
