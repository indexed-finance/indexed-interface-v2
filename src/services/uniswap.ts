import { BaseToken } from "./web3";
import {
  BigNumber,
  getUniswapData,
  toTokenAmount,
} from "@indexed-finance/indexed.js";
import { ERRORS } from "config";
import Web3 from "web3";
import settings from "settings.json";

const WHITELIST = (settings.whitelist as Record<string, BaseToken[]>)[
  "mainnet" as string
];

export default class UniswapService {
  public provider: Web3;
  public token: BaseToken;
  public address: string;
  public pairs: null | UniswapPairData[];
  public ethBalance: null | BigNumber;
  public tokenBalance: null | BigNumber;

  constructor(provider: Web3, token: BaseToken, address: string) {
    this.provider = provider;
    this.token = token;
    this.address = address;
    this.pairs = null;
    this.ethBalance = null;
    this.tokenBalance = null;
  }

  public async refresh() {
    const {
      pairs,
      ethBalance,
      tokenABalance: tokenBalance,
    } = await getUniswapData(
      this.provider,
      this.token,
      WHITELIST,
      this.address
    );

    this.pairs = pairs;

    if (ethBalance) {
      this.ethBalance = ethBalance;
    }

    if (tokenBalance) {
      this.tokenBalance = tokenBalance;
    }
  }

  public async getAmountOut(
    inputAddress: string,
    outputAddress: string,
    amount: BigNumber
  ) {
    const result = await this.getAmount(
      getAmountOut,
      inputAddress,
      outputAddress,
      amount
    );

    return toTokenAmount(result, 18);
  }

  public async getAmountIn(
    inputAddress: string,
    outputAddress: string,
    amount: BigNumber
  ) {
    const result = await this.getAmount(
      getAmountIn,
      inputAddress,
      outputAddress,
      amount
    );

    return toTokenAmount(result, 18);
  }

  private async getAmount(
    getter: (...args: any) => BigNumber,
    inputAddress: string,
    outputAddress: string,
    amount: BigNumber
  ) {
    const inputToken = this.getTokenData(inputAddress);
    const outputToken = this.getTokenData(outputAddress);
    const inputIsOwnToken =
      inputToken.address.toLowerCase() === this.token.address.toLowerCase();
    const options: {
      getPairForAddress: string;
      firstArg: "reservesA" | "reservesB";
      secondArg: "reservesA" | "reservesB";
    } = inputIsOwnToken
      ? {
          getPairForAddress: outputToken.address,
          firstArg: "reservesA",
          secondArg: "reservesB",
        }
      : {
          getPairForAddress: inputToken.address,
          firstArg: "reservesB",
          secondArg: "reservesA",
        };
    const pair = this.getPairedToken(options.getPairForAddress);
    const result = getter(
      amount,
      pair[options.firstArg],
      pair[options.secondArg]
    );

    return result;
  }

  private getTokenData(address: string): BaseToken {
    const inWhitelist = WHITELIST.find(
      (token) => address.toLowerCase() === token.address.toLowerCase()
    );
    const matchesToken =
      address.toLowerCase() === this.token.address.toLowerCase();

    if (inWhitelist) {
      return inWhitelist;
    } else if (matchesToken) {
      return this.token;
    } else {
      throw new Error(ERRORS.UniswapService.tokenDoesntExist);
    }
  }

  private getPairedToken(address: string) {
    const pairedToken = (this.pairs || []).find(
      (pair) => pair.tokenB.toLowerCase() === address
    );

    if (pairedToken) {
      return pairedToken;
    } else {
      throw new Error(ERRORS.UniswapService.pairedTokenDoesntExist);
    }
  }
}

// #region Helpers
function getAmountOut(
  amountIn: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber
): BigNumber {
  const amountInWithFee = amountIn.times(997);
  const numerator = amountInWithFee.times(reserveOut);
  const denominator = reserveIn.times(1000).plus(amountInWithFee);
  return numerator.div(denominator);
}

function getAmountIn(
  amountOut: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber
): BigNumber {
  const numerator = reserveIn.times(amountOut).times(1000);
  const denominator = reserveOut.minus(amountOut).times(997);
  return numerator.div(denominator).plus(1);
}
// #endregion

// #region Internal Models
type UniswapPairData = {
  tokenA: string;
  tokenB: string;
  pairAddress: string;
  reservesA: BigNumber;
  reservesB: BigNumber;
  allowanceA?: BigNumber;
  allowanceB?: BigNumber;
  balanceB?: BigNumber;
};
// #endregion
