import * as balancerMath from "ethereum/utils/balancer-math";
import { Result as AbiCoderResult } from "ethers/lib/utils";
import { IPool } from "ethereum/abi";
import { MultiCallTaskHandler, PoolDataTask } from "./types";
import { NormalizedPool } from "ethereum/types";
import { convert, dedupe } from "helpers";
import chunk from "lodash.chunk";
import type { Call, MultiCallResults } from "./types";

const POOL_UPDATE_TOKEN_DATA_STARTING_INDEX = 3;
const POOL_UPDATE_TOKEN_CALL_COUNT = 3;

function buildPoolUpdateCalls(
  _poolId: string,
  _tokenAddresses: string[]
): Call[] {
  const _interface = IPool;
  const _tokenCalls = _tokenAddresses.reduce((prev, next) => {
    prev.push(
      {
        target: _poolId,
        interface: _interface,
        function: "getBalance",
        args: [next],
      },
      {
        target: _poolId,
        interface: _interface,
        function: "getMinimumBalance",
        args: [next],
      },
      {
        target: _poolId,
        interface: _interface,
        function: "getDenormalizedWeight",
        args: [next],
      }
    );
    return prev;
  }, [] as Call[]);
  const _poolCalls = [
    {
      target: _poolId,
      interface: _interface,
      function: "getTotalDenormalizedWeight",
    },
    {
      target: _poolId,
      interface: _interface,
      function: "totalSupply",
    },
    {
      target: _poolId,
      interface: _interface,
      function: "getSwapFee",
    },
    ..._tokenCalls,
  ];
  return _poolCalls;
}

function formatPoolUpdateResults(
  { blockNumber, results }: MultiCallResults,
  tokenAddresses: string[]
) {
  const [totalDenorm, totalSupply, swapFee] = results.map(([raw]) =>
    convert.toBigNumber(raw)
  );
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

const PoolDataTaskHandler: MultiCallTaskHandler<PoolDataTask> = {
  kind: "PoolData",
  onlyUniqueTasks: (tasks) => {
    const tasksByPool = tasks.reduce((prev, next) => {
      const { pool, tokens } = next.args;

      if (prev[pool]) {
        const task = prev[pool];
        task.args.tokens.push(...tokens);
        task.args.tokens = dedupe(task.args.tokens);
      } else {
        prev[pool] = {
          id: next.id,
          kind: next.kind,
          args: {
            pool,
            tokens: dedupe(tokens),
          },
        };
      }
      return prev;
    }, {} as Record<string, PoolDataTask>);
    return Object.values(tasksByPool);
  },
  constructCalls: (_, { pool, tokens }) => buildPoolUpdateCalls(pool, tokens),
  handleResults: (
    { actions, selectors, dispatch, state },
    { pool, tokens },
    results
  ) => {
    if (actions && selectors) {
      const update = formatPoolUpdateResults(results, tokens);
      const _pool = selectors.selectPool(state, pool) as NormalizedPool;

      if (pool) {
        dispatch(actions.poolUpdated({ pool: _pool, update }));
        dispatch(actions.retrieveCoingeckoData(pool));
        dispatch(actions.requestPoolTradesAndSwaps(pool));
      }
    }
  },
};

export default PoolDataTaskHandler;
