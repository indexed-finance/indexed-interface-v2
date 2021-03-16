import * as balancerMath from "./utils/balancer-math";
import { BigNumber } from "bignumber.js";
import { FormattedIndexPool } from "features";
import { NormalizedPool, PoolTokenUpdate } from "./types.d";
import { convert } from "helpers";

export * from "./utils";
export * from "./subgraph";
export * from "./multicall";
export * from "./transactions";

export const ZERO = balancerMath.ZERO;
export const ONE = balancerMath.ONE;
export const BONE = balancerMath.BONE;

type PoolTokenData = {
  usedDenorm: string;
  usedBalance: string;
};

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
  pool: NormalizedPool,
  inputToken: PoolTokenData,
  tokenAmountIn: BigNumber
) {
  const [balanceIn, weightIn, totalWeight, totalSupply, swapFee] = [
    inputToken.usedBalance,
    inputToken.usedDenorm,
    pool.totalDenorm,
    pool.totalSupply,
    pool.swapFee
  ].map(convert.toBigNumber);

  if (tokenAmountIn.eq(0)) {
    return { error: "Input can not be zero." };
  }
  if (tokenAmountIn.isGreaterThan(balanceIn.div(2))) {
    return { error: "Input must be less than 1/2 the pool's balance." };
  }

  const poolAmountOut = balancerMath.calcPoolOutGivenSingleIn(
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
  pool: NormalizedPool,
  inputToken: PoolTokenData,
  poolAmountOut: BigNumber
) {
  const [balanceIn, weightIn, totalWeight, totalSupply, swapFee] = [
    inputToken.usedBalance,
    inputToken.usedDenorm,
    pool.totalDenorm,
    pool.totalSupply,
    pool.swapFee
  ].map(convert.toBigNumber);

  if (poolAmountOut.eq(0)) {
    return { error: "Input can not be zero." };
  }

  const tokenAmountIn = balancerMath.calcSingleInGivenPoolOut(
    balanceIn,
    weightIn,
    totalSupply,
    totalWeight,
    poolAmountOut,
    swapFee
  );
  if (tokenAmountIn.isGreaterThan(balanceIn.div(2))) {
    return { error: "Input must be less than 1/2 the pool's balance.", tokenAmountIn };
  }
  return { tokenAmountIn };
}
