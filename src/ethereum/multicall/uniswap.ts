import { Result as AbiCoderResult } from "ethers/lib/utils";
import { Pair } from "ethereum/abi";
import { Provider } from "@ethersproject/providers";

import { multicallViaInterface } from "./utils";
import type { Call } from "./utils";

export interface UniswapReserves {
  reserves0: string;
  reserves1: string;
}

export async function uniswapUpdateMulticall(
  _provider: Provider,
  _pairs: string[]
) {
  const _interface = Pair;
  const _pairCalls = _pairs.map(
    (pair) => ({
      target: pair,
      function: "getReserves",
      args: [],
    }),
    [] as Call[]
  );
  const result = await multicallViaInterface(
    _provider,
    _interface,
    _pairCalls,
    false
  );
  return formatPairs(result, _pairs);
}

export function formatPairs(
  { results }: { blockNumber: string; results: AbiCoderResult[] },
  pairs: string[]
): Record<string, UniswapReserves> {
  return pairs.reduce((prev, next, i) => {
    const [reserves0, reserves1] = results[i];
    prev[next] = {
      reserves0: reserves0.toString(),
      reserves1: reserves1.toString(),
    };
    return prev;
  }, {} as Record<string, UniswapReserves>);
}
