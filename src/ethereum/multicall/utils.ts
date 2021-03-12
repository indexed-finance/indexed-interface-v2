import { BigNumber } from "@ethersproject/bignumber";
import {
  FunctionFragment,
  Interface,
  JsonFragment,
  ParamType,
  defaultAbiCoder,
} from "@ethersproject/abi";
import { Provider } from "@ethersproject/providers";
import { chunk } from "lodash";
import type { Call, MultiCallResults } from "./types";

import {
  MultiCall as bytecode,
  MultiCallStrict as bytecodeStrict,
} from "./bytecode.json";

interface CondensedCall {
  target: string;
  callData: string;
  interface: Interface;
}

const toInterface = (_interface: Interface | JsonFragment[]) =>
  Array.isArray(_interface) ? new Interface(_interface) : _interface;

function condenseCalls(
  _calls: Call[],
  _interface?: Interface,
): CondensedCall[] {
  return _calls.reduce(
    (prev, next) => {
      const {
        target,
        function: callFunction,
        args,
        interface: callInterface,
      } = next;
      const interface_ = callInterface ? toInterface(callInterface) : _interface;
      if (!interface_) {
        throw new Error(`Interface not provided for call`);
      }
      const callData = interface_.encodeFunctionData(callFunction, args);
      prev.push({ callData, interface: interface_, target });
      return prev;
    },
    [] as CondensedCall[]
  );
}

const hasNumber = (str: string) => /\d/.test(str);

function getDefaultForBaseType(baseType: string) {
  if (baseType.includes("uint")) return BigNumber.from(0);
  if (baseType.includes("int")) return BigNumber.from(0);
  if (baseType.includes("string")) return "";
  if (baseType.includes("bytes")) {
    if (hasNumber(baseType)) {
      const num = +baseType.slice(5);
      return "0x".padEnd((num + 1) * 2, "00");
    }
    return "0x";
  }
  if (baseType === "bool") return false;
}

function getDefaultForParamType(param: ParamType): any {
  if (param.components?.length) {
    return param.components.map(getDefaultForParamType);
  }
  const baseValue = getDefaultForBaseType(param.baseType);
  if (param.arrayLength) {
    return new Array(param.arrayLength).fill(baseValue);
  }
  return baseValue;
}

function getDefaultResultForFunction(fn: FunctionFragment): any[] {
  const { outputs } = fn;
  if (!outputs) return [];
  return outputs.map((t) => getDefaultForParamType(t));
}

async function executeChunk(
  _provider: Provider,
  _calls: CondensedCall[],
  _strict?: boolean,
) {
  const inputData = defaultAbiCoder.encode(
    ["address[]", "bytes[]"],
    [_calls.map(c => c.target), _calls.map(c => c.callData)]
  );
  const bytecodeToUse = _strict ? bytecodeStrict : bytecode;
  const without0x = inputData.slice(2);
  const data = bytecodeToUse.concat(without0x);
  const encodedResult = await _provider.call({ data });
  const [blockNumber, decodedResult] = defaultAbiCoder.decode(
    ["uint256", "bytes[]"],
    encodedResult
  );
  return { blockNumber, decodedResult };
}

export async function multicall(
  _provider: Provider,
  _calls: Call[],
  _interface?: Interface,
  _strict?: boolean,
): Promise<MultiCallResults> {
  const calls = condenseCalls(_calls, _interface);
  const chunks = chunk(calls, 30);
  const allResults = await Promise.all(chunks.map(chunk => executeChunk(_provider, chunk, _strict)));
  const blockNumber = allResults.map(r => r.blockNumber).sort()[0];
  const decodedResult = allResults.reduce((prev, next) => ([...prev, ...next.decodedResult]), [] as string[]);
  const formattedResults = (decodedResult as string[]).map((result, index) => {
    return result === "0x"
      ? getDefaultResultForFunction(
          calls[index].interface.getFunction((_calls[index] as Call).function)
        )
      : calls[index].interface.decodeFunctionResult(
          (_calls[index] as Call).function,
          result
        );
  });

  return {
    blockNumber,
    results: formattedResults,
  };
}