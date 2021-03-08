import { Result as AbiCoderResult } from "ethers/lib/utils";
import { Provider } from "@ethersproject/providers";
import chunk from "lodash.chunk";

import { IERC20 } from "ethereum/abi";

import { convert } from "helpers";

import { multicallViaInterface } from "./utils";
import type { Call } from "./utils";
import type { PoolUnderlyingToken } from "indexed-types";

const TOKEN_USER_DATA_CALL_COUNT = 2;

export async function tokenUserDataMulticall(
  _provider: Provider,
  _sourceAddress: string,
  _spenderAddress: string,
  _tokens: PoolUnderlyingToken[]
) {
  const _interface = IERC20;
  const _tokenAddresses = _tokens.map(({ token: { id } }) => id);
  const _tokenCalls = _tokens.reduce((prev, next) => {
    prev.push(
      {
        target: next.token.id,
        function: "allowance",
        args: [_sourceAddress, _spenderAddress],
      },
      {
        target: next.token.id,
        function: "balanceOf",
        args: [_sourceAddress],
      }
    );
    return prev;
  }, [] as Call[]);

  const result = await multicallViaInterface(
    _provider,
    _interface,
    _tokenCalls,
    true
  );

  return {
    blockNumber: result.blockNumber,
    data: formatTokenUserData(result, _tokenAddresses),
  };
}

function formatTokenUserData(
  { results }: { blockNumber: string; results: AbiCoderResult[] },
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

  return tokens;
}