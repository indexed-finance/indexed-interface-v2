import {
  BigNumber,
  formatBalance,
  toBN,
  toHex,
  toTokenAmount,
} from "@indexed-finance/indexed.js";
import { ChainId, Pair, Token, TokenAmount } from "@uniswap/sdk";
import { DEFAULT_DECIMAL_COUNT } from "config";
import { FormattedPair, provider } from "features";
import { NormalizedToken } from "ethereum";
import { getAddress } from "@ethersproject/address";

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
  // Address
  toChecksumAddress: (address: string) => getAddress(address),
  toAddressBuffer: (address: string) => Buffer.from(address.slice(2).padStart(40, '0'), 'hex'),
  // Uniswap SDK
  toToken: (amount: string | BigNumber, decimals: number = DEFAULT_DECIMAL_COUNT) =>
    toTokenAmount(convert.toBigNumber(amount), decimals),
  toUniswapSDKToken: (token: NormalizedToken) =>
    provider && new Token(
      provider?.network.chainId as ChainId,
      convert.toChecksumAddress(token.id),
      token.decimals,
      token.symbol,
      token.name
    ),
  toUniswapSDKTokenAmount: (token: NormalizedToken, amount: string) =>
    provider && new TokenAmount(convert.toUniswapSDKToken(token) as Token, amount),
  toUniswapSDKPair: (pair: FormattedPair) =>
    provider && new Pair(
      convert.toUniswapSDKTokenAmount(pair.token0, pair.reserves0) as TokenAmount,
      convert.toUniswapSDKTokenAmount(pair.token1, pair.reserves1) as TokenAmount
    )
};

export default convert;
