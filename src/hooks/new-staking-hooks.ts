import { NewStakingMeta, NewStakingPool } from "features/newStaking";
import { selectors } from "features";
import { useCallRegistrar } from "./use-call-registrar";
import { useSelector } from "react-redux";
import { useUserAddress } from "./user-hooks";
import type { RegisteredCall } from "helpers";

export function createNewStakingCalls(
  multiTokenStaking: string,
  pid: string,
  stakingToken: string,
  userAddress?: string
): {
  onChainCalls: RegisteredCall[];
  offChainCalls: RegisteredCall[];
} {
  const onChainCalls: RegisteredCall[] = [
    {
      interfaceKind: "IERC20_ABI",
      target: stakingToken,
      function: "balanceOf",
      args: [multiTokenStaking]
    },
  ];

  if (userAddress) {
    onChainCalls.push(
      {
        target: multiTokenStaking,
        function: 'userInfo',
        args: [pid, userAddress],
        interfaceKind: "MultiTokenStaking_ABI",
      },
      {
        target: multiTokenStaking,
        function: 'pendingRewards',
        args: [pid, userAddress],
        interfaceKind: "MultiTokenStaking_ABI",
      }
    );
  }

  return {
    onChainCalls,
    offChainCalls: [],
  };
}
export const NEW_STAKING_CALLER = "NewStaking";

export function useNewStakingRegistrar() {
  const userAddress = useUserAddress();
  const meta: NewStakingMeta = useSelector(selectors.selectNewStakingMeta)
  const stakingPools: NewStakingPool[] = useSelector(
    selectors.selectAllNewStakingPools
  );
  const { onChainCalls, offChainCalls } = stakingPools.reduce(
    (prev, next) => {
      const poolCalls = createNewStakingCalls(meta.id, next.id, next.token, userAddress);

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
    caller: NEW_STAKING_CALLER,
    onChainCalls,
    offChainCalls,
  });
}
