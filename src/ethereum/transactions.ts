import { BigNumber } from "./utils/balancer-math";
import { Contract } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";

import { IERC20, IPool } from "./abi";
import { convert } from "helpers";

/**
 *
 * @remarks
 * The amount parameter is unformatted (i.e. 1.50)
 *
 * @param signer - The user's signing client.
 * @param poolAddress - Which pool should be approved?
 * @param tokenAddress - Which token in the pool should be approved?
 * @param amount - How much should the approval be limited to?
 */
 export function approvePool(
  signer: JsonRpcSigner,
  poolAddress: string,
  tokenAddress: string,
  amount: string
) {
  const contract = new Contract(tokenAddress, IERC20, signer);
  const formattedAmount = convert.toHex(convert.toToken(amount));

  return contract.approve(poolAddress, formattedAmount);
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