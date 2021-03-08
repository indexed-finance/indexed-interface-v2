import { BigNumber } from "./balancer-math";

export function upwardSlippage(num: BigNumber, slippage: number): BigNumber {
  return num.times(1 + slippage).integerValue();
}

export function downwardSlippage(num: BigNumber, slippage: number): BigNumber {
  return num.times(1 - slippage).integerValue();
}
