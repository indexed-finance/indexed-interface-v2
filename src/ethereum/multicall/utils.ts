import { BigNumber } from "@ethersproject/bignumber";
import {
  FunctionFragment,
  Interface,
  JsonFragment,
  ParamType,
} from "@ethersproject/abi";
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers";
import { MULTICALL2_ADDRESS } from "../../config";
import { chunk } from "lodash";
import { constants } from "ethers";
import { getContract } from "ethereum/abi";
import type { Call, MulticallResults } from "./types";

interface CondensedCall {
  target: string;
  callData: string;
  interface: Interface;
}

// Ensure we don't surpass the 25kb limit.
const CHUNK_CALL_COUNT = 150;

const toInterface = (_interface: Interface | JsonFragment[]) =>
  Array.isArray(_interface) ? new Interface(_interface) : _interface;

function condenseCalls(
  _calls: Call[],
  _interface?: Interface
): CondensedCall[] {
  return _calls.reduce((prev, next) => {
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
  }, [] as CondensedCall[]);
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
  _provider: JsonRpcProvider | JsonRpcSigner,
  _calls: CondensedCall[],
  _strict?: boolean
) {
  try {
    const multicallContract = getContract(
      MULTICALL2_ADDRESS,
      "MultiCall2",
      _provider
    );
    const { blockNumber, returnData } =
      await multicallContract.callStatic.tryBlockAndAggregate(
        false,
        _calls.map((c) => ({ target: c.target ? c.target : constants.AddressZero, callData: c.callData }))
      );
    const decodedResult = returnData.map((r) =>
      r.success ? r.returnData : "0x"
    );
    return { blockNumber: blockNumber.toNumber(), decodedResult };
  } catch (err) {
    console.log("Got mC err");
    console.log(err);
    throw err;
  }
}

export async function multicall(
  _provider: JsonRpcProvider | JsonRpcSigner,
  _calls: Call[],
  _interface?: Interface,
  _strict?: boolean
): Promise<MulticallResults> {
  const calls = condenseCalls(_calls, _interface);
  const chunks = chunk(calls, CHUNK_CALL_COUNT);
  const allResults = await Promise.all(
    chunks.map((chunk) => executeChunk(_provider, chunk, _strict))
  );
  const blockNumber = allResults.map((r) => r.blockNumber).sort()[0];
  const decodedResult = allResults.reduce(
    (prev, next) => [...prev, ...next.decodedResult],
    [] as string[]
  );
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
    blockNumber: blockNumber,
    results: formattedResults,
  };
}
