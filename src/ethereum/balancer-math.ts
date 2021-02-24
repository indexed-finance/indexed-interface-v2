import { BigNumber } from "bignumber.js";
import { BigNumberish as eBigNumberish } from "ethers";
import { formatEther } from "ethers/lib/utils";

// #region BigNumber
BigNumber.config({
  EXPONENTIAL_AT: [-100, 100],
  ROUNDING_MODE: 1,
  DECIMAL_PLACES: 18,
});

export type BigNumberish = eBigNumberish | BigNumber;

export { BigNumber };

export const toBN = (num: BigNumberish): BigNumber => bnum(num);

export function toWei(val: BigNumberish): BigNumber {
  return scale(bnum(val.toString()), 18).integerValue();
}

export function fromWei(val: BigNumberish): string {
  return formatEther(val.toString());
}

export function toTokenAmount(val: BigNumberish, decimals: number): BigNumber {
  return scale(bnum(val.toString()), decimals).integerValue();
}

export function toHex(val: BigNumber): string {
  return `0x${val.integerValue().toString(16)}`;
}

export const formatBalance = (
  balance: BigNumber,
  decimals: number,
  precision: number
): string => {
  if (balance.eq(0)) {
    return bnum(0).toFixed(2);
  }

  const result = scale(balance, -decimals)
    .decimalPlaces(precision, BigNumber.ROUND_DOWN)
    .toString();

  return padToDecimalPlaces(result, 2);
};

export const padToDecimalPlaces = (
  value: string,
  minDecimals: number
): string => {
  const split = value.split(".");
  const zerosToPad = split[1] ? minDecimals - split[1].length : minDecimals;

  if (zerosToPad > 0) {
    let pad = "";

    // Add decimal point if no decimal portion in original number
    if (zerosToPad === minDecimals) {
      pad += ".";
    }
    for (let i = 0; i < zerosToPad; i++) {
      pad += "0";
    }
    return value + pad;
  }
  return value;
};
// #endregion

// #region Balancer Math
export const BONE = new BigNumber(10).pow(18);
export const EXIT_FEE = new BigNumber(0);
export const TWOBONE = BONE.times(new BigNumber(2));
const BPOW_PRECISION = BONE.idiv(new BigNumber(10).pow(10));

export const MAX_IN_RATIO = BONE.times(new BigNumber(0.499999999999999)); // Leave some room for bignumber rounding errors
export const MAX_OUT_RATIO = BONE.times(new BigNumber(0.333333333333333)); // Leave some room for bignumber rounding errors
export const MIN_WEIGHT = BONE.div(4);

export function scale(input: BigNumber, decimalPlaces: number): BigNumber {
  const scalePow = new BigNumber(decimalPlaces.toString());
  const scaleMul = new BigNumber(10).pow(scalePow);
  return input.times(scaleMul);
}

export function bnum(val: BigNumberish): BigNumber {
  return new BigNumber(val.toString());
}

export function calcOutGivenIn(
  tokenBalanceIn: BigNumber,
  tokenWeightIn: BigNumber,
  tokenBalanceOut: BigNumber,
  tokenWeightOut: BigNumber,
  tokenAmountIn: BigNumber,
  swapFee: BigNumber
): BigNumber {
  const weightRatio = bdiv(tokenWeightIn, tokenWeightOut);
  let adjustedIn = BONE.minus(swapFee);
  adjustedIn = bmul(tokenAmountIn, adjustedIn);
  const y = bdiv(tokenBalanceIn, tokenBalanceIn.plus(adjustedIn));
  const foo = bpow(y, weightRatio);
  const bar = BONE.minus(foo);
  const tokenAmountOut = bmul(tokenBalanceOut, bar);
  return tokenAmountOut;
}

export function calcInGivenOut(
  tokenBalanceIn: BigNumber,
  tokenWeightIn: BigNumber,
  tokenBalanceOut: BigNumber,
  tokenWeightOut: BigNumber,
  tokenAmountOut: BigNumber,
  swapFee: BigNumber
) {
  const weightRatio = bdiv(tokenWeightOut, tokenWeightIn);
  const diff = tokenBalanceOut.minus(tokenAmountOut);
  const y = bdiv(tokenBalanceOut, diff);
  let foo = bpow(y, weightRatio);
  foo = foo.minus(BONE);
  let tokenAmountIn = BONE.minus(swapFee);
  tokenAmountIn = bdiv(bmul(tokenBalanceIn, foo), tokenAmountIn);
  return tokenAmountIn;
}

export function calcSpotPrice(
  tokenBalanceIn: BigNumber,
  tokenWeightIn: BigNumber,
  tokenBalanceOut: BigNumber,
  tokenWeightOut: BigNumber,
  swapFee: BigNumber
) {
  const numer = bdiv(tokenBalanceIn, tokenWeightIn);
  const denom = bdiv(tokenBalanceOut, tokenWeightOut);
  const ratio = bdiv(numer, denom);
  const scale = bdiv(BONE, bsubSign(BONE, swapFee).res);
  return bmul(ratio, scale);
}

export function calcAllInGivenPoolOut(
  tokenBalances: BigNumber[],
  poolSupply: BigNumber,
  poolAmountOut: BigNumber
) {
  const ratio = bdiv(poolAmountOut, poolSupply);
  const amountsIn: BigNumber[] = [];
  for (let i = 0; i < tokenBalances.length; i++) {
    const balance = tokenBalances[i];
    amountsIn.push(bmul(ratio, balance));
  }
  return amountsIn;
}

export function calcPoolOutGivenSingleIn(
  tokenBalanceIn: BigNumber,
  tokenWeightIn: BigNumber,
  poolSupply: BigNumber,
  totalWeight: BigNumber,
  tokenAmountIn: BigNumber,
  swapFee: BigNumber
): BigNumber {
  const normalizedWeight = bdiv(tokenWeightIn, totalWeight);
  const zaz = bmul(BONE.minus(normalizedWeight), swapFee);
  const tokenAmountInAfterFee = bmul(tokenAmountIn, BONE.minus(zaz));

  const newTokenBalanceIn = tokenBalanceIn.plus(tokenAmountInAfterFee);
  const tokenInRatio = bdiv(newTokenBalanceIn, tokenBalanceIn);

  const poolRatio = bpow(tokenInRatio, normalizedWeight);
  const newPoolSupply = bmul(poolRatio, poolSupply);
  const poolAmountOut = newPoolSupply.minus(poolSupply);
  return poolAmountOut;
}

export function calcPoolInGivenSingleOut(
  tokenBalanceOut: BigNumber,
  tokenWeightOut: BigNumber,
  poolSupply: BigNumber,
  totalWeight: BigNumber,
  tokenAmountOut: BigNumber,
  swapFee: BigNumber
): BigNumber {
  const normalizedWeight = bdiv(tokenWeightOut, totalWeight);
  const zoo = BONE.minus(normalizedWeight);
  const zar = bmul(zoo, swapFee);
  const tokenAmountOutBeforeSwapFee = bdiv(tokenAmountOut, BONE.minus(zar));

  const newTokenBalanceOut = tokenBalanceOut.minus(tokenAmountOutBeforeSwapFee);
  const tokenOutRatio = bdiv(newTokenBalanceOut, tokenBalanceOut);

  const poolRatio = bpow(tokenOutRatio, normalizedWeight);
  const newPoolSupply = bmul(poolRatio, poolSupply);
  const poolAmountInAfterExitFee = poolSupply.minus(newPoolSupply);

  const poolAmountIn = bdiv(poolAmountInAfterExitFee, BONE.minus(EXIT_FEE));
  return poolAmountIn;
}

export function calcAllOutGivenPoolIn(
  tokenBalances: BigNumber[],
  tokenDenorms: BigNumber[],
  poolSupply: BigNumber,
  poolAmountIn: BigNumber
) {
  const exitFee = bmul(poolAmountIn, EXIT_FEE);
  const pAiAfterExitFee = poolAmountIn.minus(exitFee);
  const ratio = bdiv(pAiAfterExitFee, poolSupply);
  const amountsOut: BigNumber[] = [];
  for (let i = 0; i < tokenDenorms.length; i++) {
    const balance = tokenBalances[i];
    const denorm = tokenDenorms[i];
    if (denorm.eq(0)) {
      amountsOut.push(bnum(0));
    } else {
      amountsOut.push(bmul(ratio, balance));
    }
  }
  return amountsOut;
}

export function calcSingleInGivenPoolOut(
  tokenBalanceIn: BigNumber,
  tokenWeightIn: BigNumber,
  poolSupply: BigNumber,
  totalWeight: BigNumber,
  poolAmountOut: BigNumber,
  swapFee: BigNumber
): BigNumber {
  const normalizedWeight = bdiv(tokenWeightIn, totalWeight);
  const newPoolSupply = poolSupply.plus(poolAmountOut);
  const poolRatio = bdiv(newPoolSupply, poolSupply);

  const boo = bdiv(BONE, normalizedWeight);
  const tokenInRatio = bpow(poolRatio, boo);
  const newTokenBalanceIn = bmul(tokenInRatio, tokenBalanceIn);
  const tokenAmountInAfterFee = newTokenBalanceIn.minus(tokenBalanceIn);

  const zar = bmul(BONE.minus(normalizedWeight), swapFee);
  const tokenAmountIn = bdiv(tokenAmountInAfterFee, BONE.minus(zar));
  return tokenAmountIn;
}

export function calcSingleOutGivenPoolIn(
  tokenBalanceOut: BigNumber,
  tokenWeightOut: BigNumber,
  poolSupply: BigNumber,
  totalWeight: BigNumber,
  poolAmountIn: BigNumber,
  swapFee: BigNumber
): BigNumber {
  const normalizedWeight = bdiv(tokenWeightOut, totalWeight);
  const poolAmountInAfterExitFee = bmul(poolAmountIn, BONE.minus(EXIT_FEE));
  const newPoolSupply = poolSupply.minus(poolAmountInAfterExitFee);
  const poolRatio = bdiv(newPoolSupply, poolSupply);

  const tokenOutRatio = bpow(poolRatio, bdiv(BONE, normalizedWeight));
  const newTokenBalanceOut = bmul(tokenOutRatio, tokenBalanceOut);

  const tokenAmountOutBeforeSwapFee = tokenBalanceOut.minus(newTokenBalanceOut);

  const zaz = bmul(BONE.minus(normalizedWeight), swapFee);
  const tokenAmountOut = bmul(tokenAmountOutBeforeSwapFee, BONE.minus(zaz));
  return tokenAmountOut;
}

export function bmul(a: BigNumber, b: BigNumber): BigNumber {
  const c0 = a.times(b);
  const c1 = c0.plus(BONE.div(new BigNumber(2)));
  const c2 = c1.idiv(BONE);
  return c2;
}

export function bdiv(a: BigNumber, b: BigNumber): BigNumber {
  const c0 = a.times(BONE);
  const c1 = c0.plus(b.div(new BigNumber(2)));
  const c2 = c1.idiv(b);
  return c2;
}

export function btoi(a: BigNumber): BigNumber {
  return a.idiv(BONE);
}

export function bfloor(a: BigNumber): BigNumber {
  return btoi(a).times(BONE);
}

export function bsubSign(
  a: BigNumber,
  b: BigNumber
): { res: BigNumber; bool: boolean } {
  if (a.gte(b)) {
    const res = a.minus(b);
    const bool = false;
    return { res, bool };
  } else {
    const res = b.minus(a);
    const bool = true;
    return { res, bool };
  }
}

function bpowi(a: BigNumber, n: BigNumber): BigNumber {
  let z = !n.modulo(new BigNumber(2)).eq(new BigNumber(0)) ? a : BONE;

  for (
    n = n.idiv(new BigNumber(2));
    !n.eq(new BigNumber(0));
    n = n.idiv(new BigNumber(2))
  ) {
    a = bmul(a, a);
    if (!n.modulo(new BigNumber(2)).eq(new BigNumber(0))) {
      z = bmul(z, a);
    }
  }
  return z;
}

export function bpow(base: BigNumber, exp: BigNumber): BigNumber {
  const whole = bfloor(exp);
  const remain = exp.minus(whole);
  const wholePow = bpowi(base, btoi(whole));
  if (remain.eq(new BigNumber(0))) {
    return wholePow;
  }

  const partialResult = bpowApprox(base, remain, BPOW_PRECISION);
  return bmul(wholePow, partialResult);
}

function bpowApprox(
  base: BigNumber,
  exp: BigNumber,
  precision: BigNumber
): BigNumber {
  const a = exp;
  const { res: x, bool: xneg } = bsubSign(base, BONE);
  let term = BONE;
  let sum = term;
  let negative = false;

  for (let i = 1; term.gte(precision); i++) {
    const bigK = new BigNumber(i).times(BONE);
    const { res: c, bool: cneg } = bsubSign(a, bigK.minus(BONE));
    term = bmul(term, bmul(c, x));
    term = bdiv(term, bigK);
    if (term.eq(new BigNumber(0))) break;

    if (xneg) negative = !negative;
    if (cneg) negative = !negative;
    if (negative) {
      sum = sum.minus(term);
    } else {
      sum = sum.plus(term);
    }
  }

  return sum;
}
// #endregion
