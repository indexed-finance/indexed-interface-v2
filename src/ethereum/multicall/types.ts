import {
  Result as AbiCoderResult,
  Interface,
  JsonFragment
} from "@ethersproject/abi";
import { AppDispatch, AppState } from "features";

export type Call = {
  target: string;
  interface?: Interface | JsonFragment[];
  function: string;
  args?: Array<any>;
};

export type MultiCallTaskKind = "PoolData" | "TokenUserData" | "UniswapPairsData";

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
  account?: string;
}

export interface MultiCallTaskHandler<
  TaskType extends MultiCallTask = MultiCallTask
> {
  kind: TaskType["kind"],
  constructCalls: (context: Omit<MultiCallContext, "dispatch">, taskArgs: TaskType["args"]) => Call[],
  handleResults: (context: MultiCallContext, taskArgs: TaskType["args"], results: MultiCallResults) => void
}

export interface UniswapPairsDataTask extends MultiCallTask<string[]> {
  kind: "UniswapPairsData";
}

export interface TokenUserDataTask extends MultiCallTask<{ pool: string; tokens: string[]; }> {
  kind: "TokenUserData";
}

export interface PoolDataTask extends MultiCallTask<{ pool: string; tokens: string[]; }> {
  kind: "PoolData";
}

export type MultiCallTaskConfig = UniswapPairsDataTask | TokenUserDataTask | PoolDataTask;