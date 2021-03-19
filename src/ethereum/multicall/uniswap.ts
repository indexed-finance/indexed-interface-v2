import { BigNumber } from "@ethersproject/bignumber";
import { MultiCallTaskHandler, UniswapPairsDataTask } from "./types";
import { Pair } from "ethereum/abi";
import { PairReservesUpdate } from "ethereum/types";
import { dedupe } from "helpers";
import type { Call, MultiCallResults } from "./types";

function parsePairReservesResults(
  results: MultiCallResults,
  pairs: string[]
): PairReservesUpdate[] {
  return results.results.reduce((prev, next, index) => {
    const [reserves0, reserves1] = next;
    const exists = !BigNumber.from(reserves0.toString()).eq(0);
    const pairUpdate: PairReservesUpdate = {
      id: pairs[index].toLowerCase(),
      exists,
      reserves0: reserves0.toString(),
      reserves1: reserves1.toString(),
    };
    return [...prev, pairUpdate];
  }, [] as PairReservesUpdate[]) as PairReservesUpdate[];
}

const UniswapPairsDataTaskHandler: MultiCallTaskHandler<UniswapPairsDataTask> = {
  kind: "UniswapPairsData",
  onlyUniqueTasks: (tasks) => {
    const allPairs = dedupe(tasks.reduce((prev, next) => {
      return [...prev, ...next.args];
    }, [] as string[]));
    if (allPairs.length === 0) return [];
    return [
      {
        id: tasks[0].id,
        kind: "UniswapPairsData",
        args: allPairs,
      },
    ];
  },
  constructCalls: (_, pairs) => {
    const _interface = Pair;
    return pairs.map(
      (pair) => ({
        target: pair,
        interface: _interface,
        function: "getReserves",
        args: [],
      }),
      [] as Call[]
    );
  },
  handleResults: ({ actions, dispatch }, pairs, results) => {
    const updates = parsePairReservesResults(results, pairs);

    if (actions) {
      dispatch(actions.uniswapPairsUpdated(updates));
    }
  },
};

export default UniswapPairsDataTaskHandler;
