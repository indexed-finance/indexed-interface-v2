import * as balancerMath from "./balancer-math";
import * as config from "config";
import * as queries from "./queries";
import { BigNumber } from "bignumber.js";
import { Contract } from "ethers";
import { Interface, Result, defaultAbiCoder } from "ethers/lib/utils";
import { JsonFragment } from "@ethersproject/abi";
import { JsonRpcSigner, Provider } from "@ethersproject/providers";
import {
  NormalizedEntity,
  NormalizedInitialData,
  NormalizedToken,
} from "./types.d";
import {
  MultiCall as bytecode,
  MultiCallStrict as bytecodeStrict,
} from "./bytecode.json";
import { convert } from "helpers";
import { dedupe } from "helpers";
import BPool from "./abi/BPool.json";
import IERC20 from "./abi/IERC20.json";
import IPool from "./abi/IPool.json";
import axios from "axios";
import chunk from "lodash.chunk";
import type {
  Category,
  IndexPool,
  PoolUnderlyingToken,
  Swap,
} from "indexed-types";
import type { Swap as Trade } from "uniswap-types";

export const MINIMUM_TOKEN_WEIGHT = convert.toBigNumber("10").pow(18).div(4);
export const POOL_UPDATE_TOKEN_DATA_STARTING_INDEX = 4;
export const POOL_UPDATE_TOKEN_CALL_COUNT = 3;
export const TOKEN_USER_DATA_CALL_COUNT = 2;
export const ZERO = convert.toBigNumber("0");
export const ONE = convert.toBigNumber("1");
export const TOKEN_AMOUNT = convert.toBigNumber("10").exponentiatedBy(18);

// #region Querying
export function getUrl(chainId: number) {
  if (chainId === 1) {
    return config.INDEXED_SUBGRAPH_URL;
  } else {
    return config.INDEXED_RINKEBY_SUBGRAPH_URL;
  }
}

export async function sendQuery(query: string, url: string) {
  const {
    data: { data },
  } = await axios.post(url, {
    query,
  });
  return data;
}

export async function querySinglePool(
  url: string,
  address: string
): Promise<IndexPool> {
  const { indexPool } = await sendQuery(queries.singlePool(address), url);
  return indexPool;
}

export async function queryAllPools(url: string): Promise<IndexPool[]> {
  const { indexPools } = await sendQuery(queries.allPools, url);
  return indexPools;
}

export async function queryPoolUpdate(
  url: string,
  poolAddress: string
): Promise<IndexPool> {
  const { indexPool } = await sendQuery(queries.poolUpdate(poolAddress), url);
  return indexPool;
}

export async function queryInitial(url: string): Promise<Category[]> {
  const { categories } = await sendQuery(queries.initial, url);
  return categories;
}

export async function queryTrades(
  url: string,
  poolAddress: string
): Promise<Trade[]> {
  const { swaps } = await sendQuery(queries.trade(poolAddress), url);
  return swaps;
}

export async function querySwaps(
  url: string,
  poolAddress: string
): Promise<Swap[]> {
  const { swaps } = await sendQuery(queries.swap(poolAddress), url);
  return swaps;
}
// #endregion

// #region Multicall
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

export function condenseCalls(_interface: Interface, _calls: Call[]) {
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

export async function multicallViaInterface(
  _provider: Provider,
  _interface: Interface,
  _calls: Call[],
  _strict: boolean
) {
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
    .filter((result, index) => result !== "0x" && Boolean(_calls[index]))
    .map((result, index) =>
      _interface.decodeFunctionResult((_calls[index] as Call).function, result)
    );

  return {
    blockNumber,
    results: formattedResults,
  };
}

export async function poolUpdateMulticall(
  _provider: Provider,
  _poolId: string,
  _tokens: PoolUnderlyingToken[]
) {
  const _interface = new Interface(IPool);
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
        function: "getUsedBalance",
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
      function: "getMaxPoolTokens",
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

export async function tokenUserDataMulticall(
  _provider: Provider,
  _sourceAddress: string,
  _destinationAddress: string,
  _tokens: PoolUnderlyingToken[]
) {
  const _abi = IERC20;
  const _interface = new Interface(_abi);
  const _tokenAddresses = _tokens.map(({ token: { id } }) => id);
  const _tokenCalls = _tokens.reduce((prev, next) => {
    prev.push(
      {
        target: next.token.id,
        function: "allowance",
        args: [_sourceAddress, _destinationAddress],
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

  return formatTokenUserData(result, _tokenAddresses);
}
// #endregion

// #region Formatters
export function normalizeInitialData(categories: Category[]) {
  return categories.slice(0, categories.length - 1).reduce(
    (prev, next) => {
      const category = next;
      const normalizedTokensForCategory = {
        ids: [],
        entities: {},
        // Category data.
      } as NormalizedEntity<NormalizedToken>;
      prev.categories.ids.push(category.id);
      prev.categories.entities[category.id] = {
        indexPools: category.indexPools.map(({ id }) => id),
        tokens: category.tokens.map(({ id }) => id),
      };

      // Token data.
      const categoryTokenIds = [];
      for (const categoryToken of category.tokens) {
        const { id: tokenId, symbol } = categoryToken;

        categoryTokenIds.push(tokenId);
        normalizedTokensForCategory.ids.push(tokenId);
        normalizedTokensForCategory.entities[tokenId] = {
          id: tokenId,
          symbol,
          coingeckoId: "",
          dataByCategory: {
            [category.id]: categoryToken,
          },
          dataByIndexPool: {},
          dataFromPoolUpdates: {},
        };
      }

      // Pool data.
      const categoryIndexPoolIds: string[] = [];
      for (const indexPool of category.indexPools) {
        const { dailySnapshots, tokens } = indexPool;

        categoryIndexPoolIds.push(indexPool.id);

        const dailySnapshotIds = [];
        for (const snapshot of dailySnapshots) {
          dailySnapshotIds.push(snapshot.id);
          prev.dailySnapshots.ids.push(snapshot.id);
          prev.dailySnapshots.entities[snapshot.id] = snapshot;
        }

        const tokenIds = [];
        for (const token of tokens ?? []) {
          const [, tokenId] = token.id.split("-");

          tokenIds.push(tokenId);
          normalizedTokensForCategory.entities[tokenId].dataByIndexPool[
            indexPool.id
          ] = token;
        }

        prev.pools.ids.push(indexPool.id);
        prev.pools.entities[indexPool.id] = {
          ...indexPool,
          dailySnapshots: dailySnapshotIds,
          tokens: tokenIds,
          dataFromUpdates: null,
          dataForTradesAndSwaps: null,
          dataForUser: null,
        };
      }

      prev.tokens.ids = dedupe(
        prev.tokens.ids.concat(normalizedTokensForCategory.ids)
      );

      for (const id of normalizedTokensForCategory.ids) {
        const { ...oldData } = prev.tokens.entities[id] ?? {};
        const { ...newData } = normalizedTokensForCategory.entities[id];

        prev.tokens.entities[id] = {
          ...newData,
          dataByCategory: {
            ...oldData.dataByCategory,
            ...newData.dataByCategory,
          },
          dataByIndexPool: {
            ...oldData.dataByIndexPool,
            ...newData.dataByIndexPool,
          },
        };
      }

      return prev;
    },
    {
      categories: {
        ids: [],
        entities: {},
      },
      pools: {
        ids: [],
        entities: {},
      },
      dailySnapshots: {
        ids: [],
        entities: {},
      },
      tokens: {
        ids: [],
        entities: {},
      },
    } as NormalizedInitialData
  );
}

export function formatPoolUpdate(
  { blockNumber, results }: { blockNumber: string; results: Result[] },
  tokenAddresses: string[]
) {
  const [
    totalDenorm,
    totalSupply,
    maxTotalSupply,
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
  }, {} as Record<string, Result[]>);
  const tokens = tokenAddresses
    .map((address) => responseDataByTokenAddress[address])
    .map((response, index) => {
      const [balance, usedBalance, usedDenorm] = response.map(([raw]) =>
        convert.toBigNumber(raw)
      );
      const actualUsedDenorm = usedDenorm.eq(0)
        ? MINIMUM_TOKEN_WEIGHT
        : usedDenorm;

      return {
        address: tokenAddresses[index],
        balance: balance.toString(),
        usedBalance: usedBalance.toString(),
        usedDenorm: actualUsedDenorm.toString(),
        usedWeight: balancerMath.bdiv(actualUsedDenorm, totalDenorm).toString(),
      };
    });

  return {
    $blockNumber: blockNumber.toString(),
    totalDenorm: totalDenorm.toString(),
    totalSupply: totalSupply.toString(),
    maxTotalSupply: maxTotalSupply.toString(),
    swapFee: swapFee.toString(),
    tokens,
  };
}

export function formatTokenUserData(
  { results }: { blockNumber: string; results: Result[] },
  tokenAddresses: string[]
) {
  const responseDataByTokenAddress = chunk(
    results,
    TOKEN_USER_DATA_CALL_COUNT
  ).reduce((prev, next, index) => {
    prev[tokenAddresses[index]] = next;
    return prev;
  }, {} as Record<string, Result[]>);
  const tokens = tokenAddresses.reduce((prev, next) => {
    const [allowance, balance] = responseDataByTokenAddress[next].map((entry) =>
      convert.toBigNumber(entry.toString()).toString()
    );

    prev[next] = { allowance, balance };
    return prev;
  }, {} as Record<string, { allowance: string; balance: string }>);

  return tokens;
}
// #endregion

// #region Contract Interaction
/**
 *
 * @remarks
 * The amount parameter is unformatted (i.e. 1.50)
 *
 * @param signer - The user's signing client.
 * @param poolAddress - Which pool should be approved?
 * @param tokenAddress - Which token in the pool should be approved?
 * @param amount - How much should the approval be limited to?
 */
export function approvePool(
  signer: JsonRpcSigner,
  poolAddress: string,
  tokenAddress: string,
  amount: string
) {
  const abi = new Interface(IERC20);
  const contract = new Contract(tokenAddress, abi, signer);
  const formattedAmount = convert.toHex(convert.toToken(amount));

  return contract.approve(poolAddress, formattedAmount);
}

/**
 *
 */
export async function swapExactAmountIn(
  signer: JsonRpcSigner,
  poolAddress: string,
  inputTokenAddress: string,
  outputTokenAddress: string,
  amount: string,
  minimumAmount: BigNumber,
  maximumPrice: BigNumber
) {
  const abi = new Interface(BPool.abi);
  const contract = new Contract(poolAddress, abi, signer);
  const gasPrice = await contract.signer.getGasPrice();
  const args = [
    inputTokenAddress,
    amount,
    outputTokenAddress,
    convert.toHex(minimumAmount),
    convert.toHex(maximumPrice),
  ];
  const gasLimit = await contract.estimateGas.swapExactAmountIn(...args);

  return contract.swapExactAmountIn(...args, {
    gasPrice,
    gasLimit,
  });
}

/**
 *
 */
export async function swapExactAmountOut(
  signer: JsonRpcSigner,
  poolAddress: string,
  inputTokenAddress: string,
  outputTokenAddress: string,
  amountIn: string,
  amountOut: string,
  maximumPrice: BigNumber
) {
  const abi = new Interface(BPool.abi);
  const contract = new Contract(poolAddress, abi, signer);
  const gasPrice = await contract.signer.getGasPrice();
  const args = [
    inputTokenAddress,
    amountIn,
    outputTokenAddress,
    amountOut,
    convert.toHex(maximumPrice),
  ];
  const gasLimit = await contract.estimateGas.swapExactAmountOut(...args);

  return contract.swapExactAmountOut(...args, {
    gasPrice,
    gasLimit,
  });
}

// #endregion

// #region Etc
export async function calculateOutputFromInput(
  poolAddress: string,
  inputAmount: string,
  inputToken: NormalizedToken,
  outputToken: NormalizedToken,
  swapFee: BigNumber
) {
  const inputUpdateData = inputToken.dataFromPoolUpdates[poolAddress];
  const outputUpdateData = outputToken.dataFromPoolUpdates[poolAddress];
  const outputPoolData = outputToken.dataByIndexPool[poolAddress];
  const badResult = {
    outputAmount: parseFloat(convert.toBalance(ZERO)),
    price: ZERO,
    spotPriceAfter: ZERO,
    isGoodResult: false,
  };

  if (inputUpdateData && outputUpdateData && outputPoolData) {
    const {
      usedBalance: inputUsedBalance,
      usedDenorm: inputUsedDenorm,
    } = inputUpdateData;
    const { denorm: outputDenorm } = outputPoolData;
    const {
      balance: outputBalance,
      usedBalance: outputUsedBalance,
      usedDenorm: outputUsedDenorm,
    } = outputUpdateData;

    // Convert all amounts to the tokenized version.
    const [balanceIn, weightIn, balanceOut, weightOut, amountIn] = [
      inputUsedBalance,
      inputUsedDenorm,
      outputBalance,
      outputDenorm,
      convert.toToken(inputAmount.toString()),
    ]
      .filter(Boolean)
      .map((property) => convert.toBigNumber(property!));

    // --
    if (amountIn.isLessThanOrEqualTo(convert.toBigNumber(outputUsedBalance))) {
      const amountOut = balancerMath.calcOutGivenIn(
        balanceIn,
        weightIn,
        balanceOut,
        weightOut,
        amountIn,
        swapFee
      );
      const spotPriceAfter = balancerMath.calcSpotPrice(
        balanceIn.plus(amountIn),
        weightIn,
        convert.toBigNumber(outputUsedBalance).minus(amountOut),
        convert.toBigNumber(outputUsedDenorm),
        swapFee
      );

      let price: BigNumber = ZERO;

      // Next, compute the price.
      if (amountIn.isEqualTo(0) || amountOut.isEqualTo(0)) {
        const oneToken = TOKEN_AMOUNT;
        const preciseInput = balancerMath.calcOutGivenIn(
          balanceIn,
          weightIn,
          balanceOut,
          weightOut,
          oneToken,
          swapFee
        );
        const preciseOutput = preciseInput.dividedBy(TOKEN_AMOUNT);

        price = preciseOutput.dividedBy(ONE);
      } else {
        const preciseInput = amountIn.dividedBy(TOKEN_AMOUNT);
        const preciseOutput = amountOut.dividedBy(TOKEN_AMOUNT);

        price = preciseOutput.dividedBy(preciseInput);
      }

      return {
        outputAmount: parseFloat(convert.toBalance(amountOut)),
        price,
        spotPriceAfter,
        isGoodResult: true,
      };
    } else {
      return badResult;
    }
  } else {
    return badResult;
  }
}

export async function calculateInputFromOutput(
  poolAddress: string,
  outputAmount: string,
  inputToken: NormalizedToken,
  outputToken: NormalizedToken,
  swapFee: BigNumber
) {
  const inputUpdateData = inputToken.dataFromPoolUpdates[poolAddress];
  const outputUpdateData = outputToken.dataFromPoolUpdates[poolAddress];
  const outputPoolData = outputToken.dataByIndexPool[poolAddress];
  const badResult = {
    inputAmount: parseFloat(convert.toBalance(ZERO)),
    price: ZERO,
    spotPriceAfter: ZERO,
    isGoodResult: false,
  };

  if (inputUpdateData && outputUpdateData && outputPoolData) {
    const {
      usedBalance: inputUsedBalance,
      usedDenorm: inputUsedDenorm,
    } = inputUpdateData;
    const {
      balance: outputBalance,
      usedBalance: outputUsedBalance,
      usedDenorm: outputUsedDenorm,
    } = outputUpdateData;
    const { denorm: outputDenorm } = outputPoolData;
    const [balanceIn, weightIn, balanceOut, weightOut, amountOut] = [
      inputUsedBalance,
      inputUsedDenorm,
      outputBalance,
      outputDenorm,
      convert.toToken(outputAmount.toString()),
    ]
      .filter(Boolean)
      .map((property) => convert.toBigNumber(property!));

    if (
      amountOut.isLessThanOrEqualTo(
        convert.toBigNumber(outputUsedBalance).div(3)
      )
    ) {
      const amountIn = balancerMath.calcInGivenOut(
        balanceIn,
        weightIn,
        balanceOut,
        weightOut,
        amountOut,
        swapFee
      );
      const spotPriceAfter = balancerMath.calcSpotPrice(
        balanceIn.plus(amountIn),
        weightIn,
        convert.toBigNumber(outputUsedBalance).minus(amountOut),
        convert.toBigNumber(outputUsedDenorm),
        swapFee
      );

      return {
        inputAmount: parseFloat(convert.toBalance(amountIn)),
        spotPriceAfter,
        isGoodResult: true,
      };
    } else {
      return badResult;
    }
  } else {
    return badResult;
  }
}

export function upwardSlippage(num: BigNumber, slippage: number): BigNumber {
  return num.times(1 + slippage).integerValue();
}

export function downwardSlippage(num: BigNumber, slippage: number): BigNumber {
  return num.times(1 - slippage).integerValue();
}
// #endregion
