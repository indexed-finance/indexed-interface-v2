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
 * @param poolAddress - Which pool should be approved?
 * @param tokenAddress - Which token in the pool should be approved?
 * @param amount - How much should the approval be limited to? Must be exact amount.
 */
export function approvePool(
  signer: JsonRpcSigner,
  poolAddress: string,
  tokenAddress: string,
  amount: string
) {
  const contract = new Contract(tokenAddress, IERC20, signer);
  const formattedAmount = convert.toHex(convert.toBigNumber(amount));

  return contract.approve(poolAddress, formattedAmount);
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
  console.log(`Got Result For Uniswap Execution::`);
  console.log({ args, value, methodName })
  const gas = await contract.estimateGas[methodName](...args, { value });

  return contract[methodName](...args, {
    value,
    gasLimit: calculateGasMargin(gas.toString())
  });
}

/**
 *
 */
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
  const gasPrice = await contract.signer.getGasPrice();
  const args = [
    inputTokenAddress,
    convert.toHex(amountIn),
    outputTokenAddress,
    convert.toHex(minimumAmountOut),
    convert.toHex(maximumPrice),
  ];
  const gasLimit = await contract.estimateGas.swapExactAmountIn(...args);

  return contract.swapExactAmountIn(...args, {
    gasPrice,
    gasLimit,
  });
}

/**
 *
 */
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
  const gasPrice = await contract.signer.getGasPrice();
  const args = [
    inputTokenAddress,
    convert.toHex(maxAmountIn),
    outputTokenAddress,
    convert.toHex(amountOut),
    convert.toHex(maximumPrice),
  ];
  const gasLimit = await contract.estimateGas.swapExactAmountOut(...args);

  return contract.swapExactAmountOut(...args, {
    gasPrice,
    gasLimit,
  });
}
