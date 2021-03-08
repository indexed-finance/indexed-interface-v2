import * as balancerMath from "./utils/balancer-math";
import { BigNumber } from "bignumber.js";

import { PoolTokenUpdate } from "./types.d";
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

export async function calculateOutputFromInput(
  inputData: PoolTokenData,
  outputData: PoolTokenData,
  inputAmount: string,
  swapFee: BigNumber
) {
  const badResult = {
    outputAmount: parseFloat(convert.toBalance(ZERO)),
    price: ZERO,
    spotPriceAfter: ZERO,
    isGoodResult: false,
  };

  if (inputData && outputData) {
    // --
    const [balanceIn, weightIn, balanceOut, weightOut, amountIn] = [
      convert.toBigNumber(inputData.usedBalance),
      convert.toBigNumber(inputData.usedDenorm),
      convert.toBigNumber(outputData.usedBalance),
      convert.toBigNumber(outputData.usedDenorm),
      convert.toToken(inputAmount),
    ];
    if (amountIn.isLessThanOrEqualTo(balanceIn.div(2))) {
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
        balanceOut.minus(amountOut),
        weightOut,
        swapFee
      );

      let price: BigNumber = ZERO;

      // Next, compute the price.
      if (amountIn.isEqualTo(0) || amountOut.isEqualTo(0)) {
        const oneToken = BONE;
        const preciseInput = balancerMath.calcOutGivenIn(
          balanceIn,
          weightIn,
          balanceOut,
          weightOut,
          oneToken,
          swapFee
        );
        const preciseOutput = preciseInput.dividedBy(BONE);

        price = preciseOutput.dividedBy(ONE);
      } else {
        const preciseInput = amountIn.dividedBy(BONE);
        const preciseOutput = amountOut.dividedBy(BONE);

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
  inputData: PoolTokenData,
  outputData: PoolTokenUpdate,
  outputAmount: string,
  swapFee: BigNumber
) {
  const badResult = {
    inputAmount: parseFloat(convert.toBalance(ZERO)),
    price: ZERO,
    spotPriceAfter: ZERO,
    isGoodResult: false,
  };

  const {
    usedBalance: inputUsedBalance,
    usedDenorm: inputUsedDenorm,
  } = inputData;
  const {
    balance: outputBalance,
    usedBalance: outputUsedBalance,
    denorm: outputDenorm,
    usedDenorm: outputUsedDenorm,
  } = outputData;

  if (inputData && outputData) {
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
