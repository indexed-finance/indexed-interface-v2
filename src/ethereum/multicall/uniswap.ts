import { BigNumber } from "@ethersproject/bignumber";
import { MultiCallResults } from "./utils";
import { Pair } from "ethereum/abi";
import { PairReservesUpdate } from "ethereum/types";
import type { Call } from "./utils";

export interface UniswapReserves {
  reserves0: string;
  reserves1: string;
}

export function buildPairReservesDataCalls(
  _pairs: string[]
): Call[] {
  const _interface = Pair;
  return _pairs.map(
    (pair) => ({
      target: pair,
      interface: _interface,
      function: "getReserves",
      args: [],
    }),
    [] as Call[]
  );
}

export function formatPairReservesResults(
  results: MultiCallResults,
  pairs: string[]
): PairReservesUpdate[] {
  return results.results.reduce((prev, next, index) => {
    const [reserves0, reserves1] = next;
    const exists = !(BigNumber.from(reserves0.toString()).eq(0));
    const pairUpdate: PairReservesUpdate = {
      id: pairs[index].toLowerCase(),
      exists,
      reserves0: reserves0.toString(),
      reserves1: reserves1.toString()
    };
    return [...prev, pairUpdate];
  }, [] as PairReservesUpdate[]) as PairReservesUpdate[];
}
