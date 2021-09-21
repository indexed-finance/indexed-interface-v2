import { BigNumber } from "helpers";
import { DNDX_ADDRESS, DNDX_TIMELOCK_ADDRESS } from "config";
import { TIMELOCKS_CALLER, selectors } from "features";
import { useAddTransactionCallback } from "./transaction-hooks";
import { useCallRegistrar } from "./use-call-registrar";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useTimelockContract } from "./contract-hooks";
import { useUserAddress } from "./user-hooks";

export function useTimelockCreator() {
  const contract = useTimelockContract();
  const addTransaction = useAddTransactionCallback();
  const createTimelock = useCallback(
    (ndxAmount: BigNumber, duration: BigNumber) => {
      if (!contract) throw new Error();

      const tx = contract.deposit(ndxAmount.toString(), duration.toString());

      addTransaction(tx);
    },
    [contract, addTransaction]
  );

  return createTimelock;
}

export function useUserTimelocks() {
  const userTimelocks = useSelector(selectors.selectUserTimelocks);

  return userTimelocks;
}

export function useTimelocksRegistrar(timelockIds: string[]) {
  const userAddress = useUserAddress();
  const caller = TIMELOCKS_CALLER;
  const onChainCalls = [
    ...timelockIds.map((id) => ({
      caller,
      target: DNDX_TIMELOCK_ADDRESS,
      interfaceKind: "SharesTimeLock" as any,
      function: "locks",
      args: [id],
    })),
    {
      caller,
      target: DNDX_ADDRESS,
      interfaceKind: "IERC20" as any,
      function: "balanceOf",
      args: [userAddress],
    },
    {
      caller,
      target: DNDX_ADDRESS,
      interfaceKind: "ERC20DividendsOwned" as any,
      function: "withdrawableDividendsOf",
      args: [userAddress],
    },
    {
      caller,
      target: DNDX_ADDRESS,
      interfaceKind: "ERC20DividendsOwned" as any,
      function: "withdrawnDividendsOf",
      args: [userAddress],
    },
  ];

  useCallRegistrar({ caller, onChainCalls, offChainCalls: [] });
}
