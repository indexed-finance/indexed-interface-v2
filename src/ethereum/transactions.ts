import { BigNumber } from "./utils/balancer-math";
import { Contract } from "ethers";
import { IERC20, IPool, UniswapV2Router } from "./abi";
import { JSBI, Percent, Router, Trade } from "@uniswap/sdk";
import { JsonRpcSigner } from "@ethersproject/providers";
import { UNISWAP_ROUTER_ADDRESS } from "config";
import { convert } from "helpers";

export function calculateGasMargin(value: string): string {
  return convert.toBigNumber(value).times(1.1).integerValue().toString(10);
}

/**
 *
 * @remarks
 * The amount parameter is unformatted (i.e. 1.50)
 *
 * @param signer - The user's signing client.
 * @param spenderAddress - Address of the spender to approve
 * @param tokenAddress - ERC20 token address
 * @param amount - Exact amount of tokens to allow spender to transfer
 */
export function approveSpender(
  signer: JsonRpcSigner,
  spenderAddress: string,
  tokenAddress: string,
  amount: string
) {
  const contract = new Contract(tokenAddress, IERC20, signer);
  const formattedAmount = convert.toHex(convert.toBigNumber(amount));

  return contract.approve(spenderAddress, formattedAmount);
}

export async function executeUniswapTrade(
  signer: JsonRpcSigner,
  userAddress: string,
  trade: Trade,
  allowedSlippage = 2
) {
  const contract = new Contract(UNISWAP_ROUTER_ADDRESS, UniswapV2Router, signer);
  const timestamp = +(Date.now() / 1000).toFixed(0);
  const gracePeriod = 1800; // add 30 minutes
  const deadline = timestamp + gracePeriod;
  const { args, value, methodName } = Router.swapCallParameters(trade, {
    feeOnTransfer: false,
    allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), JSBI.BigInt(10000)),
    recipient: userAddress,
    deadline
  });

  return contract[methodName](...args, { value });
}

export async function swapExactAmountIn(
  signer: JsonRpcSigner,
  poolAddress: string,
  inputTokenAddress: string,
  outputTokenAddress: string,
  amountIn: BigNumber,
  minimumAmountOut: BigNumber,
  maximumPrice: BigNumber
) {
  const contract = new Contract(poolAddress, IPool, signer);
  const args = [
    inputTokenAddress,
    convert.toHex(amountIn),
    outputTokenAddress,
    convert.toHex(minimumAmountOut),
    convert.toHex(maximumPrice),
  ];
  return contract.swapExactAmountIn(...args);
}

export async function swapExactAmountOut(
  signer: JsonRpcSigner,
  poolAddress: string,
  inputTokenAddress: string,
  outputTokenAddress: string,
  maxAmountIn: BigNumber,
  amountOut: BigNumber,
  maximumPrice: BigNumber
) {
  const contract = new Contract(poolAddress, IPool, signer);
  const args = [
    inputTokenAddress,
    convert.toHex(maxAmountIn),
    outputTokenAddress,
    convert.toHex(amountOut),
    convert.toHex(maximumPrice),
  ];

  return contract.swapExactAmountOut(...args);
}

export async function joinswapExternAmountIn(
  signer: JsonRpcSigner,
  poolAddress: string,
  inputTokenAddress: string,
  tokenAmountIn: BigNumber,
  minPoolAmountOut: BigNumber
) {
  const contract = new Contract(poolAddress, IPool, signer);
  const args = [
    inputTokenAddress,
    convert.toHex(tokenAmountIn),
    convert.toHex(minPoolAmountOut),
  ];
  return contract.joinswapExternAmountIn(...args);
}

export async function joinswapPoolAmountOut(
  signer: JsonRpcSigner,
  poolAddress: string,
  inputTokenAddress: string,
  poolAmountOut: BigNumber,
  maxAmountIn: BigNumber
) {
  const contract = new Contract(poolAddress, IPool, signer);
  const args = [
    inputTokenAddress,
    convert.toHex(poolAmountOut),
    convert.toHex(maxAmountIn),
  ];
  return contract.joinswapPoolAmountOut(...args);
}

export async function exitswapPoolAmountIn(
  signer: JsonRpcSigner,
  poolAddress: string,
  outputTokenAddress: string,
  poolAmountIn: BigNumber,
  minAmountOut: BigNumber
) {
  const contract = new Contract(poolAddress, IPool, signer);
  const args = [
    outputTokenAddress,
    convert.toHex(poolAmountIn),
    convert.toHex(minAmountOut),
  ];
  return contract.exitswapPoolAmountIn(...args);
}

export async function exitswapExternAmountOut(
  signer: JsonRpcSigner,
  poolAddress: string,
  outputTokenAddress: string,
  tokenAmountOut: BigNumber,
  maxPoolAmountIn: BigNumber
) {
  const contract = new Contract(poolAddress, IPool, signer);
  const args = [
    outputTokenAddress,
    convert.toHex(tokenAmountOut),
    convert.toHex(maxPoolAmountIn),
  ];
  return contract.exitswapExternAmountOut(...args);
}