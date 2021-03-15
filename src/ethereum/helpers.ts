import * as balancerMath from "./utils/balancer-math";
import { BigNumber } from "bignumber.js";
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

export function calculateSwapAmountIn(
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

export function calculateSwapAmountOut(
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
  if (amountIn.isGreaterThan(balanceIn.div(2))) {
    return { error: "Input must be less than 1/2 the pool's balance." };
  }
  if (amountIn.eq(0)) {
    return { error: "Input can not be zero." };
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
