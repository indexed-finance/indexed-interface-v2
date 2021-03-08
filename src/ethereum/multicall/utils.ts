import { Result as AbiCoderResult, FunctionFragment, Interface, JsonFragment, ParamType, defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Provider } from "@ethersproject/providers";

import {
  MultiCall as bytecode,
  MultiCallStrict as bytecodeStrict,
} from "./bytecode.json";

export type Call = {
  target: string;
  interface?: Interface | JsonFragment[];
  function: string;
  args?: Array<any>;
};

export type CondensedCalls = {
  callData: string[];
  interfaces: (Interface | JsonFragment[] | undefined)[];
  targets: string[];
};

export function condenseCalls(_interface: Interface, _calls: Call[]): CondensedCalls {
  return _calls.reduce(
    (prev, next) => {
      const {
        target,
        function: callFunction,
        args,
        interface: callInterface,
      } = next;
      const callData = _interface.encodeFunctionData(callFunction, args);

      prev.callData.push(callData);
      prev.interfaces.push(callInterface);
      prev.targets.push(target);

      return prev;
    },
    {
      callData: [],
      interfaces: [],
      targets: [],
    } as CondensedCalls
  );
}

const hasNumber = (str: string) => /\d/.test(str);

function getDefaultForBaseType(baseType: string) {
  if (baseType.includes("uint")) return BigNumber.from(0);
  if (baseType.includes("int")) return BigNumber.from(0);
  if (baseType.includes("string")) return "";
  if (baseType.includes("bytes")) {
    if (hasNumber(baseType)) {
      const num = +(baseType.slice(5));
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
  return outputs.map(t => getDefaultForParamType(t));
}

export async function multicallViaInterface(
  _provider: Provider,
  _interface: Interface,
  _calls: Call[],
  _strict: boolean
): Promise<{ blockNumber: string, results: AbiCoderResult[] }> {
  const { callData, targets } = condenseCalls(_interface, _calls);
  const inputData = defaultAbiCoder.encode(
    ["address[]", "bytes[]"],
    [targets, callData]
  );
  const bytecodeToUse = _strict ? bytecodeStrict : bytecode;
  const without0x = inputData.slice(2);
  const data = bytecodeToUse.concat(without0x);
  const encodedResult = await _provider.call({ data });
  const [blockNumber, decodedResult] = defaultAbiCoder.decode(
    ["uint256", "bytes[]"],
    encodedResult
  );
  const formattedResults = (decodedResult as string[])
    // .filter((result, index) => result !== "0x" && Boolean(_calls[index]))
    .map((result, index) =>
      {
        // console.log((_calls[index] as Call).function)
        return (result !== "0x")
        ? _interface.decodeFunctionResult((_calls[index] as Call).function, result)
        : getDefaultResultForFunction(_interface.getFunction((_calls[index] as Call).function))
      }
    );

  return {
    blockNumber,
    results: formattedResults,
  };
}