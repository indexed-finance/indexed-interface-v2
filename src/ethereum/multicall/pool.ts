import { Result as AbiCoderResult } from "ethers/lib/utils";
import { Provider } from "@ethersproject/providers";
import chunk from "lodash.chunk";

import { IPool } from "ethereum/abi";

import * as balancerMath from "ethereum/utils/balancer-math";
import { convert } from "helpers";
import { multicallViaInterface } from "./utils";

import type { Call } from "./utils";
import type { PoolUnderlyingToken } from "indexed-types";

const POOL_UPDATE_TOKEN_DATA_STARTING_INDEX = 3;
const POOL_UPDATE_TOKEN_CALL_COUNT = 3;

export async function poolUpdateMulticall(
  _provider: Provider,
  _poolId: string,
  _tokens: PoolUnderlyingToken[]
) {
  const _interface = IPool;
  const _tokenAddresses = _tokens.map(({ token: { id } }) => id);
  const _tokenCalls = _tokens.reduce((prev, next) => {
    prev.push(
      {
        target: _poolId,
        function: "getBalance",
        args: [next.token.id],
      },
      {
        target: _poolId,
        function: "getMinimumBalance",
        args: [next.token.id],
      },
      {
        target: _poolId,
        function: "getDenormalizedWeight",
        args: [next.token.id],
      }
    );
    return prev;
  }, [] as Call[]);
  const _poolCalls = [
    {
      target: _poolId,
      function: "getTotalDenormalizedWeight",
    },
    {
      target: _poolId,
      function: "totalSupply",
    },
    {
      target: _poolId,
      function: "getSwapFee",
    },
    ..._tokenCalls,
  ];
  const result = await multicallViaInterface(
    _provider,
    _interface,
    _poolCalls,
    false
  );

  return formatPoolUpdate(result, _tokenAddresses);
}

function formatPoolUpdate(
  { blockNumber, results }: { blockNumber: string; results: AbiCoderResult[] },
  tokenAddresses: string[]
) {
  const [
    totalDenorm,
    totalSupply,
    swapFee,
  ] = results.map(([raw]) => convert.toBigNumber(raw));
  const tokenDataResponses = results.slice(
    POOL_UPDATE_TOKEN_DATA_STARTING_INDEX
  );
  const responseDataByTokenAddress = chunk(
    tokenDataResponses,
    POOL_UPDATE_TOKEN_CALL_COUNT
  ).reduce((prev, next, index) => {
    prev[tokenAddresses[index]] = next;
    return prev;
  }, {} as Record<string, AbiCoderResult[]>);
  
  const tokens = tokenAddresses
    .map((address) => responseDataByTokenAddress[address])
    .map((response, index) => {
      const [balance, minimumBalance, denorm] = response.map(([raw]) =>
        convert.toBigNumber(raw)
      );
      const [usedBalance, usedDenorm] = denorm.eq(0)
        ? [minimumBalance, balancerMath.MIN_WEIGHT]
        : [balance, denorm];

      return {
        address: tokenAddresses[index],
        balance: balance.toString(),
        minimumBalance: minimumBalance.toString(),
        usedBalance: usedBalance.toString(),
        denorm: denorm.toString(),
        usedDenorm: usedDenorm.toString(),
        usedWeight: balancerMath.bdiv(usedDenorm, totalDenorm).toString(),
      };
    });

  return {
    $blockNumber: blockNumber.toString(),
    totalDenorm: totalDenorm.toString(),
    totalSupply: totalSupply.toString(),
    swapFee: swapFee.toString(),
    tokens,
  };
}