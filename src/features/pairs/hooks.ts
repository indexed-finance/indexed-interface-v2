import { PAIR_DATA_CALLER } from "./slice";
import useCallRegistrar from "hooks/use-call-registrar";
import type { RegisteredCall } from "helpers";

export type RegisteredPair = {
  id: string;
  token0: string;
  token1: string;
  exists?: boolean;
};

export function createPairDataCalls(pairs: RegisteredPair[]): RegisteredCall[] {
  return pairs.map((pair) => ({
    caller: PAIR_DATA_CALLER,
    interfaceKind: "Pair_ABI",
    target: pair.id,
    function: "getReserves",
  }));
}

export function usePairDataRegistrar(
  pairs: RegisteredPair[],
  actions: Record<string, any>,
  selectors: Record<string, any>
) {
  useCallRegistrar(
    {
      caller: PAIR_DATA_CALLER,
      onChainCalls: createPairDataCalls(pairs),
    },
    actions,
    selectors
  );
}
