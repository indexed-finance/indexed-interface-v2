import {
  Result as AbiCoderResult,
  Interface,
  JsonFragment,
} from "@ethersproject/abi";
import type { ActionType, AppDispatch, AppState, SelectorType } from "features";

export type Call = {
  target: string;
  interface?: Interface | JsonFragment[];
  function: string;
  args?: Array<any>;
};

export type MultiCallTaskKind =
  | "PoolData"
  | "TokenUserData"
  | "UniswapPairsData";

interface MultiCallTask<Args = any> {
  id: string;
  kind: MultiCallTaskKind;
  args: Args;
}

export type MultiCallResults = {
  blockNumber: number;
  results: AbiCoderResult[];
};

type MultiCallContext = {
  state: AppState;
  dispatch: AppDispatch;
  actions: ActionType;
  selectors: SelectorType;
  account?: string;
};

export interface MultiCallTaskHandler<
  TaskType extends MultiCallTask = MultiCallTask
> {
  kind: TaskType["kind"];
  onlyUniqueTasks: (tasks: TaskType[]) => TaskType[];
  constructCalls: (
    context: Omit<MultiCallContext, "dispatch">,
    taskArgs: TaskType["args"]
  ) => Call[];
  handleResults: (
    context: MultiCallContext,
    taskArgs: TaskType["args"],
    results: MultiCallResults
  ) => void;
}

export interface UniswapPairsDataTask extends MultiCallTask<string[]> {
  kind: "UniswapPairsData";
}

export interface TokenUserDataTask
  extends MultiCallTask<{ spender: string; tokens: string[] }> {
  kind: "TokenUserData";
}

export interface PoolDataTask
  extends MultiCallTask<{ pool: string; tokens: string[] }> {
  kind: "PoolData";
}

export type MultiCallTaskConfig =
  | UniswapPairsDataTask
  | TokenUserDataTask
  | PoolDataTask;
