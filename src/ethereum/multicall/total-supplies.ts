import { Result as AbiCoderResult } from "ethers/lib/utils";
import { IERC20 } from "ethereum/abi";
import { MultiCallTaskHandler, TotalSuppliesTask } from "./types";
import { convert, dedupe } from "helpers";
import chunk from "lodash.chunk";
import type { Call, MultiCallResults } from "./types";

function formatTotalSuppliesResults(
  { blockNumber, results }: MultiCallResults,
  tokens: string[]
) {
  const totalSupplies = results.map(([ totalSupply ], i) => ({
    token: tokens[i], totalSupply
  }));

  return {
    blockNumber,
    data: totalSupplies
  };
}

const TotalSuppliesTaskHandler: MultiCallTaskHandler<TotalSuppliesTask> = {
  kind: "TotalSupplies",
  onlyUniqueTasks: (tasks: TotalSuppliesTask[]): TotalSuppliesTask[] => {
    const allTokens = tasks.reduce((prev, next) => ([ ...prev, ...next.args ]), [] as string[]);
    return [{
      id: tasks[0].id,
      kind: "TotalSupplies",
      args: allTokens
    }]
  },
  constructCalls: (_, tokens): Call[] => {
    const _interface = IERC20;
    return tokens.reduce((prev, next) => {
      prev.push(
        {
          target: next,
          interface: _interface,
          function: "totalSupply",
          args: [],
        }
      );
      return prev;
    }, [] as Call[]);
  },

  handleResults: ({ actions, dispatch }, tokens, results) => {
    if (actions && results.results.length > 0) {
      const { data: supplies } = formatTotalSuppliesResults(
        results,
        tokens
      );

      dispatch(actions.totalSuppliesUpdated(supplies));
    }
  },
};

export default TotalSuppliesTaskHandler;
