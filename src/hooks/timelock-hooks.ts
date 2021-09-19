import { DNDX_ADDRESS } from "config";
import { TIMELOCKS_CALLER } from "features";
import { useCallRegistrar } from "./use-call-registrar";

export function useTimelocksRegistrar(id: string) {
  const caller = TIMELOCKS_CALLER;
  const target = id;
  const onChainCalls = [
    {
      caller,
      target,
      interfaceKind: "SharesTimeLock" as any,
      function: "locks",
      args: [id],
    },
    {
      caller,
      target: "",
      interfaceKind: "IERC20" as any,
      function: DNDX_ADDRESS,
      args: [id],
    },
    {
      caller,
      target,
      interfaceKind: "ERC20DividendsOwned" as any,
      function: "withdrawableDividendsOf",
      args: [id],
    },
    {
      caller,
      target,
      interfaceKind: "ERC20DividendsOwned" as any,
      function: "withdrawnDividendsOf",
      args: [id],
    },
  ];

  useCallRegistrar({ caller, onChainCalls, offChainCalls: [] });
}
