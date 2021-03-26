import { RegisteredCall } from "features";
import { useCallRegistrar } from "hooks";

export type RegisteredPair = {
  id: string;
  token0: string;
  token1: string;
  exists?: boolean;
};

export const pairDataCaller = "Pair Data";

export function createPairDataCalls(pairs: RegisteredPair[]): RegisteredCall[] {
  return pairs.map((pair) => ({
    caller: pairDataCaller,
    interfaceKind: "Pair_ABI",
    target: pair.id,
    function: "getReserves",
  }));
}

export function usePairDataRegistrar(pairs: RegisteredPair[]) {
  useCallRegistrar({
    caller: pairDataCaller,
    onChainCalls: createPairDataCalls(pairs),
  });
}
