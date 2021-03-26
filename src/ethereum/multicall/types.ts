import {
  Result as AbiCoderResult,
  Interface,
  JsonFragment,
} from "@ethersproject/abi";

export type Call = {
  target: string;
  interface?: Interface | JsonFragment[];
  function: string;
  args?: Array<any>;
};
export type MulticallResults = {
  blockNumber: number;
  results: AbiCoderResult[];
};
