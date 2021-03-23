import { RegisteredCall } from "features";
import { useCallRegistrar } from "hooks";

export type RegisteredPair = {
  id: string;
  token0: string;
  token1: string;
  exists?: boolean;
};

export function usePairDataRegistrar(pairs: RegisteredPair[]) {
  const caller = "Pair Data";

  useCallRegistrar({
    caller,
    onChainCalls: pairs.map(
      (pair) => ({
        caller,
        interfaceKind: "Pair_ABI",
        target: pair.id,
        function: "getReserves",
      }),
      [] as RegisteredCall[]
    ),
  });
}
