import {
  BigNumber,
  formatBalance,
  toBN,
  toHex,
  toTokenAmount,
} from "@indexed-finance/indexed.js";
import {
  ChainId,
  Currency,
  CurrencyAmount,
  Pair,
  Token,
  TokenAmount,
  WETH,
} from "@indexed-finance/narwhal-sdk";
import { DEFAULT_DECIMAL_COUNT } from "config";
import { constants } from "ethers";
import { getAddress } from "@ethersproject/address";
import type { FormattedPair, NormalizedToken } from "features";

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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
  // Address
  toChecksumAddress: (address: string) => getAddress(address),
  toAddressBuffer: (address: string) =>
    Buffer.from(address.slice(2).padStart(40, "0"), "hex"),
  toToken: (
    amount: string | BigNumber,
    decimals: number = DEFAULT_DECIMAL_COUNT
  ) => toTokenAmount(convert.toBigNumber(amount), decimals),
  toBalanceNumber: (
    amount: string | BigNumber,
    decimals: number = DEFAULT_DECIMAL_COUNT,
    precision = 4
  ) => {
    return parseFloat(
      formatBalance(convert.toBigNumber(amount), decimals, precision)
    );
  },
  toBalance: (
    amount: string | BigNumber,
    decimals: number = DEFAULT_DECIMAL_COUNT,
    withCommas = false,
    precision = 4
  ) => {
    if (withCommas) {
      return convert.toComma(
        convert.toBalanceNumber(amount, decimals, precision)
      );
    } else {
      return formatBalance(convert.toBigNumber(amount), decimals, precision);
    }
  },
  toUniswapSDKCurrency: (
    provider: ProviderLike,
    token: NormalizedToken
  ): Currency =>
    token.id === constants.AddressZero
      ? Currency.ETHER
      : new Token(
          provider.network.chainId,
          convert.toChecksumAddress(token.id),
          token.decimals,
          token.symbol,
          token.name
        ),
  toUniswapSDKCurrencyAmount: (
    provider: ProviderLike,
    token: NormalizedToken,
    amount: BigNumber
  ): CurrencyAmount =>
    token.id === constants.AddressZero
      ? CurrencyAmount.ether(amount.toString())
      : new TokenAmount(
          convert.toUniswapSDKToken(provider, token),
          amount.toString()
        ),
  // Uniswap SDK
  toUniswapSDKToken: (provider: ProviderLike, token: NormalizedToken) =>
    token.id === constants.AddressZero
      ? WETH[provider.network.chainId]
      : new Token(
          provider.network.chainId,
          convert.toChecksumAddress(token.id),
          token.decimals,
          token.symbol,
          token.name
        ),

  toUniswapSDKTokenAmount: (
    provider: ProviderLike,
    token: NormalizedToken,
    amount: string
  ) => new TokenAmount(convert.toUniswapSDKToken(provider, token), amount),

  toUniswapSDKPair: (provider: ProviderLike, pair: FormattedPair) =>
    new Pair(
      convert.toUniswapSDKTokenAmount(
        provider,
        pair.token0,
        pair.reserves0
      ) as TokenAmount,
      convert.toUniswapSDKTokenAmount(
        provider,
        pair.token1,
        pair.reserves1
      ) as TokenAmount,
      Boolean(pair.sushiswap)
    ),
};

export { convert };

type ProviderLike = { network: { chainId: ChainId } };
