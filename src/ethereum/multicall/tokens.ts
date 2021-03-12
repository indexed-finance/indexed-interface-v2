import { Result as AbiCoderResult } from "ethers/lib/utils";
import { IERC20 } from "ethereum/abi";
import { MultiCallResults } from "./utils";
import { convert } from "helpers";
import chunk from "lodash.chunk";
import type { Call } from "./utils";

const TOKEN_USER_DATA_CALL_COUNT = 2;

export function buildTokenUserDataCalls(
  _sourceAddress: string,
  _spenderAddress: string,
  _tokenAddresses: string[]
): Call[] {
  const _interface = IERC20;
  return _tokenAddresses.reduce((prev, next) => {
    prev.push(
      {
        target: next,
        interface: _interface,
        function: "allowance",
        args: [_sourceAddress, _spenderAddress],
      },
      {
        target: next,
        interface: _interface,
        function: "balanceOf",
        args: [_sourceAddress],
      }
    );
    return prev;
  }, [] as Call[]);
}

export function formatTokenUserDataResults(
  { blockNumber, results }: MultiCallResults,
  tokenAddresses: string[]
) {
  const responseDataByTokenAddress = chunk(
    results,
    TOKEN_USER_DATA_CALL_COUNT
  ).reduce((prev, next, index) => {
    prev[tokenAddresses[index]] = next;
    return prev;
  }, {} as Record<string, AbiCoderResult[]>);
  const tokens = tokenAddresses.reduce((prev, next) => {
    const [allowance, balance] = responseDataByTokenAddress[next].map((entry) =>
      convert.toBigNumber(entry.toString()).toString()
    );

    prev[next] = { allowance, balance };
    return prev;
  }, {} as Record<string, { allowance: string; balance: string }>);

  return {
    blockNumber,
    data: tokens
  };
}
