import * as balancerMath from "./utils/balancer-math";
import {
  BURN_ROUTER_ADDRESS,
  MINT_ROUTER_ADDRESS,
  UNISWAP_ROUTER_ADDRESS,
} from "config";
import { BigNumber } from "./utils/balancer-math";
import { Contract } from "ethers";
import { JSBI, Percent, Router, Trade } from "@uniswap/sdk";
import { JsonRpcSigner } from "@ethersproject/providers";
import { convert } from "helpers";
import IERC20 from "./abi/IERC20.json";
import IPool from "./abi/IPool.json";
import IndexedUniswapRouterBurner from "./abi/IndexedUniswapRouterBurner.json";
import IndexedUniswapRouterMinter from "./abi/IndexedUniswapRouterMinter.json";
import UniswapV2Router from "./abi/UniswapV2Router.json";
import type { NormalizedIndexPool } from "features";

export function calculateGasMargin(value: string): string {
  return convert.toBigNumber(value).times(1.1).integerValue().toString(10);
}

/**
 *
 * @remarks
 * The amount parameter is unformatted (i.e. 1.50)
 *
 * @param signer - The user's signing client.
 * @param spenderAddress - Address of the spender to approve
 * @param tokenAddress - ERC20 token address
 * @param amount - Exact amount of tokens to allow spender to transfer
 */
export function approveSpender(
  signer: JsonRpcSigner,
  spenderAddress: string,
  tokenAddress: string,
  amount: string
) {
  const contract = new Contract(tokenAddress, IERC20, signer);
  const formattedAmount = convert.toHex(convert.toBigNumber(amount));

  return contract.approve(spenderAddress, formattedAmount);
}

export function executeUniswapTrade(
  signer: JsonRpcSigner,
  userAddress: string,
  trade: Trade,
  allowedSlippage = 2
) {
  const contract = new Contract(
    UNISWAP_ROUTER_ADDRESS,
    UniswapV2Router,
    signer
  );
  const timestamp = +(Date.now() / 1000).toFixed(0);
  const gracePeriod = 1800; // add 30 minutes
  const deadline = timestamp + gracePeriod;
  const { args, value, methodName } = Router.swapCallParameters(trade, {
    feeOnTransfer: false,
    allowedSlippage: new Percent(
      JSBI.BigInt(allowedSlippage),
      JSBI.BigInt(10000)
    ),
    recipient: userAddress,
    deadline,
  });

  return contract[methodName](...args, { value });
}

export async function swapExactAmountIn(
  signer: JsonRpcSigner,
  poolAddress: string,
  inputTokenAddress: string,
  outputTokenAddress: string,
  amountIn: BigNumber,
  minimumAmountOut: BigNumber,
  maximumPrice: BigNumber
) {
  const contract = new Contract(poolAddress, IPool, signer);
  const args = [
    inputTokenAddress,
    convert.toHex(amountIn),
    outputTokenAddress,
    convert.toHex(minimumAmountOut),
    convert.toHex(maximumPrice),
  ];
  return contract.swapExactAmountIn(...args);
}

export async function swapExactAmountOut(
  signer: JsonRpcSigner,
  poolAddress: string,
  inputTokenAddress: string,
  outputTokenAddress: string,
  maxAmountIn: BigNumber,
  amountOut: BigNumber,
  maximumPrice: BigNumber
) {
  const contract = new Contract(poolAddress, IPool, signer);
  const args = [
    inputTokenAddress,
    convert.toHex(maxAmountIn),
    outputTokenAddress,
    convert.toHex(amountOut),
    convert.toHex(maximumPrice),
  ];

  return contract.swapExactAmountOut(...args);
}

export async function joinswapExternAmountIn(
  signer: JsonRpcSigner,
  poolAddress: string,
  inputTokenAddress: string,
  tokenAmountIn: BigNumber,
  minPoolAmountOut: BigNumber
) {
  const contract = new Contract(poolAddress, IPool, signer);
  const args = [
    inputTokenAddress,
    convert.toHex(tokenAmountIn),
    convert.toHex(minPoolAmountOut),
  ];
  return contract.joinswapExternAmountIn(...args);
}

export async function joinswapPoolAmountOut(
  signer: JsonRpcSigner,
  poolAddress: string,
  inputTokenAddress: string,
  poolAmountOut: BigNumber,
  maxAmountIn: BigNumber
) {
  const contract = new Contract(poolAddress, IPool, signer);
  const args = [
    inputTokenAddress,
    convert.toHex(poolAmountOut),
    convert.toHex(maxAmountIn),
  ];
  return contract.joinswapPoolAmountOut(...args);
}

export async function joinPool(
  signer: JsonRpcSigner,
  poolAddress: string,
  poolAmountOut: BigNumber,
  maxAmountsIn: BigNumber[]
) {
  const contract = new Contract(poolAddress, IPool, signer);
  return contract.joinPool(poolAmountOut, maxAmountsIn);
}

export async function exitswapPoolAmountIn(
  signer: JsonRpcSigner,
  poolAddress: string,
  outputTokenAddress: string,
  poolAmountIn: BigNumber,
  minAmountOut: BigNumber
) {
  const contract = new Contract(poolAddress, IPool, signer);
  const args = [
    outputTokenAddress,
    convert.toHex(poolAmountIn),
    convert.toHex(minAmountOut),
  ];
  return contract.exitswapPoolAmountIn(...args);
}

export async function exitswapExternAmountOut(
  signer: JsonRpcSigner,
  poolAddress: string,
  outputTokenAddress: string,
  tokenAmountOut: BigNumber,
  maxPoolAmountIn: BigNumber
) {
  const contract = new Contract(poolAddress, IPool, signer);
  const args = [
    outputTokenAddress,
    convert.toHex(tokenAmountOut),
    convert.toHex(maxPoolAmountIn),
  ];
  return contract.exitswapExternAmountOut(...args);
}

export async function swapTokensForTokensAndMintExact(
  signer: JsonRpcSigner,
  indexPool: string,
  maxAmountIn: BigNumber,
  path: string[],
  poolAmountOut: BigNumber
) {
  const contract = new Contract(
    MINT_ROUTER_ADDRESS,
    IndexedUniswapRouterMinter,
    signer
  );
  const args = [
    convert.toHex(maxAmountIn),
    path,
    indexPool,
    convert.toHex(poolAmountOut),
  ];
  return contract.swapTokensForTokensAndMintExact(...args);
}

export async function swapExactTokensForTokensAndMint(
  signer: JsonRpcSigner,
  indexPool: string,
  amountIn: BigNumber,
  path: string[],
  minPoolAmountOut: BigNumber
) {
  const contract = new Contract(
    MINT_ROUTER_ADDRESS,
    IndexedUniswapRouterMinter,
    signer
  );
  const args = [
    convert.toHex(amountIn),
    path,
    indexPool,
    convert.toHex(minPoolAmountOut),
  ];
  return contract.swapExactTokensForTokensAndMint(...args);
}

export async function burnExactAndSwapForTokens(
  signer: JsonRpcSigner,
  indexPool: string,
  poolAmountIn: BigNumber,
  path: string[],
  minAmountOut: BigNumber
) {
  const contract = new Contract(
    BURN_ROUTER_ADDRESS,
    IndexedUniswapRouterBurner,
    signer
  );
  const args = [
    indexPool,
    convert.toHex(poolAmountIn),
    path,
    convert.toHex(minAmountOut),
  ];
  return contract.burnExactAndSwapForTokens(...args);
}

export async function burnAndSwapForExactTokens(
  signer: JsonRpcSigner,
  indexPool: string,
  poolAmountInMax: BigNumber,
  path: string[],
  tokenAmountOut: BigNumber
) {
  const contract = new Contract(
    BURN_ROUTER_ADDRESS,
    IndexedUniswapRouterBurner,
    signer
  );
  const args = [
    indexPool,
    convert.toHex(poolAmountInMax),
    path,
    convert.toHex(tokenAmountOut),
  ];
  return contract.burnAndSwapForExactTokens(...args);
}

export function calcSwapAmountIn(
  inputToken: PoolTokenData,
  outputToken: PoolTokenData,
  amountOut: BigNumber,
  swapFee: BigNumber
): { error?: string; amountIn?: BigNumber; spotPriceAfter?: BigNumber } {
  const [balanceIn, weightIn, balanceOut, weightOut] = [
    inputToken.usedBalance,
    inputToken.usedDenorm,
    outputToken.usedBalance,
    outputToken.usedDenorm,
  ].map(convert.toBigNumber);

  if (amountOut.isGreaterThan(balanceOut.div(3))) {
    return { error: "Output can not be more than 1/3 of the pool's balance." };
  }
  if (amountOut.eq(0)) {
    return { error: "Input can not be zero." };
  }

  const amountIn = balancerMath.calcInGivenOut(
    balanceIn,
    weightIn,
    balanceOut,
    weightOut,
    amountOut,
    swapFee
  );

  if (amountIn.isGreaterThan(balanceIn.div(2))) {
    return {
      amountIn,
      error: "Input must be less than 1/2 the pool's balance.",
    };
  }

  const spotPriceAfter = balancerMath.calcSpotPrice(
    balanceIn.plus(amountIn),
    weightIn,
    balanceOut.minus(amountOut),
    weightOut,
    swapFee
  );

  return {
    amountIn,
    spotPriceAfter,
  };
}

export function calcSwapAmountOut(
  inputToken: PoolTokenData,
  outputToken: PoolTokenData,
  amountIn: BigNumber,
  swapFee: BigNumber
): { error?: string; amountOut?: BigNumber; spotPriceAfter?: BigNumber } {
  const [balanceIn, weightIn, balanceOut, weightOut] = [
    inputToken.usedBalance,
    inputToken.usedDenorm,
    outputToken.usedBalance,
    outputToken.usedDenorm,
  ].map(convert.toBigNumber);
  if (amountIn.eq(0)) {
    return { error: "Input can not be zero." };
  }
  if (amountIn.isGreaterThan(balanceIn.div(2))) {
    return { error: "Input must be less than 1/2 the pool's balance." };
  }

  const amountOut = balancerMath.calcOutGivenIn(
    balanceIn,
    weightIn,
    balanceOut,
    weightOut,
    amountIn,
    swapFee
  );
  if (amountOut.isGreaterThan(balanceOut.div(3))) {
    return {
      amountOut,
      error: "Output can not be more than 1/3 of the pool's balance.",
    };
  }

  const spotPriceAfter = balancerMath.calcSpotPrice(
    balanceIn.plus(amountIn),
    weightIn,
    balanceOut.minus(amountOut),
    weightOut,
    swapFee
  );

  return {
    amountOut,
    spotPriceAfter,
  };
}

export function calcPoolOutGivenSingleIn(
  pool: NormalizedIndexPool,
  inputToken: PoolTokenData,
  tokenAmountIn: BigNumber
) {
  const [balanceIn, weightIn, totalWeight, totalSupply, swapFee] = [
    inputToken.usedBalance,
    inputToken.usedDenorm,
    pool.totalDenorm,
    pool.totalSupply,
    pool.swapFee,
  ].map(convert.toBigNumber);

  if (tokenAmountIn.eq(0)) {
    return { error: "Input cannot be zero." };
  }
  if (tokenAmountIn.isGreaterThan(balanceIn.div(2))) {
    return { error: "Input must be less than 1/2 the pool's balance." };
  }

  const poolAmountOut = balancerMath._calcPoolOutGivenSingleIn(
    balanceIn,
    weightIn,
    totalSupply,
    totalWeight,
    tokenAmountIn,
    swapFee
  );

  return { poolAmountOut };
}

export function calcSingleInGivenPoolOut(
  pool: NormalizedIndexPool,
  inputToken: PoolTokenData,
  poolAmountOut: BigNumber
) {
  const [balanceIn, weightIn, totalWeight, totalSupply, swapFee] = [
    inputToken.usedBalance,
    inputToken.usedDenorm,
    pool.totalDenorm,
    pool.totalSupply,
    pool.swapFee,
  ].map(convert.toBigNumber);

  if (poolAmountOut.eq(0)) {
    return { error: "Input cannot be zero." };
  }

  const tokenAmountIn = balancerMath._calcSingleInGivenPoolOut(
    balanceIn,
    weightIn,
    totalSupply,
    totalWeight,
    poolAmountOut,
    swapFee
  );
  if (tokenAmountIn.isGreaterThan(balanceIn.div(2))) {
    return {
      error: "Input must be less than 1/2 the pool's balance.",
      tokenAmountIn,
    };
  }
  return { tokenAmountIn };
}

export function calcPoolInGivenSingleOut(
  pool: NormalizedIndexPool,
  outputToken: PoolTokenData,
  tokenAmountOut: BigNumber
) {
  const [balanceOut, weightOut, totalWeight, totalSupply, swapFee] = [
    outputToken.usedBalance,
    outputToken.usedDenorm,
    pool.totalDenorm,
    pool.totalSupply,
    pool.swapFee,
  ].map(convert.toBigNumber);

  if (tokenAmountOut.eq(0)) {
    return { error: "Output cannot be zero." };
  }
  if (tokenAmountOut.isGreaterThan(balanceOut.div(3))) {
    return {
      tokenAmountOut,
      error: "Output must be less than 1/3 the pool's balance.",
    };
  }

  const poolAmountIn = balancerMath._calcPoolInGivenSingleOut(
    balanceOut,
    weightOut,
    totalSupply,
    totalWeight,
    tokenAmountOut,
    swapFee
  );
  return { poolAmountIn };
}

export function calcSingleOutGivenPoolIn(
  pool: NormalizedIndexPool,
  outputToken: PoolTokenData,
  poolAmountIn: BigNumber
) {
  const [balanceOut, weightOut, totalWeight, totalSupply, swapFee] = [
    outputToken.usedBalance,
    outputToken.usedDenorm,
    pool.totalDenorm,
    pool.totalSupply,
    pool.swapFee,
  ].map(convert.toBigNumber);

  if (poolAmountIn.eq(0)) {
    return { error: "Input cannot be zero." };
  }

  const tokenAmountOut = balancerMath._calcSingleOutGivenPoolIn(
    balanceOut,
    weightOut,
    totalSupply,
    totalWeight,
    poolAmountIn,
    swapFee
  );
  if (tokenAmountOut.isGreaterThan(balanceOut.div(3))) {
    return {
      tokenAmountOut,
      error: "Output must be less than 1/3 the pool's balance.",
    };
  }
  return { tokenAmountOut };
}

type PoolTokenData = {
  usedDenorm: string;
  usedBalance: string;
};
