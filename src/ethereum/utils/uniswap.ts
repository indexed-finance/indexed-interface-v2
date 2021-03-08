import {
  BestTradeOptions,
  BigintIsh,
  Pair,
  Token,
  TokenAmount,
  Trade,
} from "@uniswap/sdk";
import { BigNumber, BigNumberish } from "ethereum/utils/balancer-math";
import { getAddress } from "ethers/lib/utils";

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
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
};

/**
 * Constructs an array of Uniswap SDK token objects from a formatted objects array
 * @param chainID - Numeric chain ID
 * @param tokenInputs - Array of tokens with fields for address, decimals, symbol, name
 * @returns Array of Uniswap SDK Token objects
 */
export const toUniswapSDKTokens = (
  chainID: number,
  tokenInputs: TokenInput[]
): Token[] =>
  tokenInputs.map(
    (token) =>
      new Token(
        chainID,
        getAddress(token.address),
        token.decimals,
        token.symbol,
        token.name
      )
  );

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
