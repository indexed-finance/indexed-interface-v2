import { convert } from "helpers";

export function getSwapCost(outputAmount: number, swapFeePercent: string) {
  return convert
    .toBigNumber(outputAmount.toString(10))
    .times(convert.toBigNumber((parseFloat(swapFeePercent) / 100).toString()))
    .toString(10);
}
