import {
  BigNumber,
  formatBalance,
  toBN,
  toHex,
  toTokenAmount,
} from "@indexed-finance/indexed.js";
import { DEFAULT_DECIMAL_COUNT } from "config";

const templateConvert = (
  number: number,
  options: Intl.NumberFormatOptions = {}
) => new Intl.NumberFormat("en-US", options).format(number);

const convert = {
  // Number
  toCurrency: (
    number: string | number,
    options: Intl.NumberFormatOptions = {}
  ) =>
    templateConvert(typeof number === "string" ? parseFloat(number) : number, {
      style: "currency",
      currency: "USD",
      ...options,
    }),
  toComma: (number: number, options: Intl.NumberFormatOptions = {}) =>
    templateConvert(number, {
      useGrouping: true,
      ...options,
    }),
  toHex: (amount: string | BigNumber) => toHex(convert.toBigNumber(amount)),
  toPercent: (number: number, options: Intl.NumberFormatOptions = {}) =>
    templateConvert(number, {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }),
  toBigNumber: (amount: string | BigNumber) => toBN(amount),
  toBalance: (amount: string | BigNumber) => {
    const result = formatBalance(
      convert.toBigNumber(amount),
      DEFAULT_DECIMAL_COUNT,
      4
    );
    return convert.toComma(parseFloat(result));
  },
  toToken: (amount: string | BigNumber) =>
    toTokenAmount(convert.toBigNumber(amount), DEFAULT_DECIMAL_COUNT),
};

export default convert;
