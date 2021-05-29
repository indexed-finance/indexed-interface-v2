import {
  BestTradeOptions,
  BigintIsh,
  Pair,
  Token,
  TokenAmount,
  Trade,
} from "@uniswap/sdk";
import { BigNumber } from "bignumber.js";
import { COMMON_BASE_TOKENS, UNISWAP_FACTORY_ADDRESS } from "config";
import { constants, BigNumberish as eBigNumberish } from "ethers";
import { convert } from "./convert";
import { flatMap } from 'lodash';
import { getCreate2Address, keccak256 } from "ethers/lib/utils";

type BigNumberish = BigNumber | eBigNumberish;

export type {
  BigNumber,
  BigintIsh,
  Token,
  Pair,
  BestTradeOptions,
  TokenAmount,
  Trade,
};

export type TokenInput = {
  id?: string;
  address?: string;
  decimals: number;
  symbol?: string;
  name?: string;
};

export function sortTokens(tokenA: string, tokenB: string): string[] {
  return tokenA.toLowerCase() < tokenB.toLowerCase()
    ? [tokenA, tokenB]
    : [tokenB, tokenA];
}

export function computeUniswapPairAddress(
  tokenA: string,
  tokenB: string
): string {
  const initCodeHash =
    "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";
  const [token0, token1] = sortTokens(tokenA, tokenB);
  const salt = keccak256(
    Buffer.concat([
      convert.toAddressBuffer(token0),
      convert.toAddressBuffer(token1),
    ])
  );
  return getCreate2Address(UNISWAP_FACTORY_ADDRESS, salt, initCodeHash);
}

/**
 * Converts a BigintIsh value to an ethers BigNumber object
 * @param amount - BigintIsh value to convert
 * @returns Converted BigNumber
 */
export const bigIntIshToBigNumber = (amount: BigintIsh): BigNumber =>
  new BigNumber(amount.toString(16), 16);

/**
 * Converts a BigNumberish value to a BigInt object
 * @param amount - BigNumberish value to convert
 * @returns Converted BigInt
 */
export const bigNumberishToBigInt = (amount: BigNumberish): BigInt =>
  BigInt(new BigNumber(amount.toString(16), 16).toString());

export const bestTradeExactIn = Trade.bestTradeExactIn;
export const bestTradeExactOut = Trade.bestTradeExactOut;

export function buildCommonTokenPairs(_tokens: string[]) {
  const bases = COMMON_BASE_TOKENS.map(t => t.id).filter(t => t !== constants.AddressZero);
  const tokens = _tokens.filter(t => t !== constants.AddressZero && !bases.includes(t));
  const basePairs = flatMap(
    bases, (base): [string, string][] => bases.map(otherBase => [base.toLowerCase(), otherBase.toLowerCase()])
  );
  const tokensToBases = flatMap(
    tokens, (token): [string, string][] => bases.map(base => [base.toLowerCase(), token.toLowerCase()])
  );
  const pairs = [
    ...basePairs,
    ...tokensToBases
  ].filter(
    ([t0, t1]) => t0 !== t1
  );
  return pairs;
}
