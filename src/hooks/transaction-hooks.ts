import { BigNumber } from "ethereum/utils/balancer-math";
import { JSBI, Percent, Router, Trade } from "@uniswap/sdk"
import { TransactionExtra } from "features";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { convert } from "helpers";
import { thunks } from "features/thunks"
import { useBurnRouterContract, useIndexPoolContract, useMintRouterContract, useStakingRewardsContract, useTokenContract, useUniswapRouterContract } from "./contract-hooks";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { usePoolSymbol } from "./pool-hooks";
import { useUserAddress } from "./user-hooks";

export function useAddTransactionCallback() {
  const dispatch = useDispatch();
  return useCallback((tx: TransactionResponse, extra: TransactionExtra = {}) => {
    return dispatch(thunks.addTransaction(tx, extra));
  }, [ dispatch ]);
}

export function useSwapTransactionCallbacks(poolAddress: string) {
  const contract = useIndexPoolContract(poolAddress);
  const addTransaction = useAddTransactionCallback();

  const swapExactAmountIn = useCallback(
    (
      inputTokenAddress: string,
      outputTokenAddress: string,
      amountIn: BigNumber,
      minimumAmountOut: BigNumber,
      maximumPrice: BigNumber
    ) => {
      // @todo Figure out a better way to handle this
      if (!contract) throw new Error();
      const args = [
        inputTokenAddress,
        convert.toHex(amountIn),
        outputTokenAddress,
        convert.toHex(minimumAmountOut),
        convert.toHex(maximumPrice),
      ];
      const tx = contract.swapExactAmountIn(...args);
      addTransaction(tx);
    },
    [contract, addTransaction]
  );

  const swapExactAmountOut = useCallback(
    (
      inputTokenAddress: string,
      outputTokenAddress: string,
      maxAmountIn: BigNumber,
      amountOut: BigNumber,
      maximumPrice: BigNumber
    ) => {
      // @todo Figure out a better way to handle this
      if (!contract) throw new Error();
      const args = [
        inputTokenAddress,
        convert.toHex(maxAmountIn),
        outputTokenAddress,
        convert.toHex(amountOut),
        convert.toHex(maximumPrice),
      ];
      const tx = contract.swapExactAmountOut(...args);
      addTransaction(tx);
    },
    [contract, addTransaction]
  );

  return { swapExactAmountIn, swapExactAmountOut };
}

export function useUniswapTransactionCallback() {
  const user = useUserAddress();
  const contract = useUniswapRouterContract();
  const addTransaction = useAddTransactionCallback();
  return useCallback((trade: Trade, allowedSlippage = 2) => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const timestamp = +(Date.now() / 1000).toFixed(0);
    const gracePeriod = 1800; // add 30 minutes
    const deadline = timestamp + gracePeriod;
    const { args, value, methodName } = Router.swapCallParameters(trade, {
      feeOnTransfer: false,
      allowedSlippage: new Percent(
        JSBI.BigInt(allowedSlippage),
        JSBI.BigInt(10000)
      ),
      recipient: user,
      deadline,
    });
    const tx = contract[methodName](...args, { value });
    addTransaction(tx);
  }, [ user, contract, addTransaction ])
}

/**
 *
 * @remarks
 * The amount parameter in the callback is a raw token amount (i.e. 0xfffffff)
 *
 * @param spenderAddress - Address of the spender to approve
 * @param tokenAddress - ERC20 token address
 */
 export function useApproveTransactionCallback(
  spenderAddress: string,
  tokenAddress: string
) {
  const contract = useTokenContract(tokenAddress);
  const addTransaction = useAddTransactionCallback();

  return useCallback(
    /** @param amount - Raw amount of tokens to allow spender to transfer */
    (amount: string) => {
      // @todo Figure out a better way to handle this
      if (!contract) throw new Error();
      const formattedAmount = convert.toHex(convert.toBigNumber(amount));
      const tx = contract.approve(spenderAddress, formattedAmount);
      addTransaction(tx)
    },
    [spenderAddress, contract, addTransaction]
  );
}

export function useMintSingleTransactionCallbacks(poolAddress: string) {
  const contract = useIndexPoolContract(poolAddress);
  const addTransaction = useAddTransactionCallback();

  const joinswapExternAmountIn = useCallback((
    inputTokenAddress: string,
    tokenAmountIn: BigNumber,
    minPoolAmountOut: BigNumber
  ) => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const args = [
      inputTokenAddress,
      convert.toHex(tokenAmountIn),
      convert.toHex(minPoolAmountOut),
    ];
    const tx = contract.joinswapExternAmountIn(...args);
    addTransaction(tx);
  }, [contract, addTransaction]);

  const joinswapPoolAmountOut = useCallback((
    inputTokenAddress: string,
    poolAmountOut: BigNumber,
    maxAmountIn: BigNumber
  ) => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const args = [
      inputTokenAddress,
      convert.toHex(poolAmountOut),
      convert.toHex(maxAmountIn),
    ];
    const tx = contract.joinswapPoolAmountOut(...args);
    addTransaction(tx);
  }, [contract, addTransaction]);

  return {
    joinswapExternAmountIn,
    joinswapPoolAmountOut
  };
}

export function useMintMultiTransactionCallback(poolAddress: string) {
  const contract = useIndexPoolContract(poolAddress);
  const addTransaction = useAddTransactionCallback();

  return useCallback((
    poolAmountOut: BigNumber,
    maxAmountsIn: BigNumber[]
  ) => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const tx = contract.joinPool(poolAmountOut, maxAmountsIn);
    addTransaction(tx);
  }, [contract, addTransaction]);
}

export function useRoutedMintTransactionCallbacks(indexPool: string) {
  const contract = useMintRouterContract();
  const addTransaction = useAddTransactionCallback();
  const poolSymbol = usePoolSymbol(indexPool);

  const mintExactAmountIn = useCallback((
    amountIn: BigNumber,
    path: string[],
    minPoolAmountOut: BigNumber
  ) => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const args = [
      convert.toHex(amountIn),
      path,
      indexPool,
      convert.toHex(minPoolAmountOut),
    ];
    const tx = contract.swapExactTokensForTokensAndMint(...args);
    const displayAmount = convert.toBalance(minPoolAmountOut, 18, true, 3);
    const summary = `Mint at least ${displayAmount} ${poolSymbol}`;
    addTransaction(tx, { summary });
  }, [contract, indexPool, poolSymbol, addTransaction]);

  const mintExactAmountOut = useCallback((
    maxAmountIn: BigNumber,
    path: string[],
    poolAmountOut: BigNumber
  ) => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const args = [
      convert.toHex(maxAmountIn),
      path,
      indexPool,
      convert.toHex(poolAmountOut),
    ];
    const tx = contract.swapTokensForTokensAndMintExact(...args);
    const displayAmount = convert.toBalance(poolAmountOut, 18, true, 3);
    const summary = `Mint ${displayAmount} ${poolSymbol}`;
    addTransaction(tx, { summary });
  }, [contract, indexPool, poolSymbol, addTransaction]);

  return { mintExactAmountIn, mintExactAmountOut };
}

interface RoutedBurnTransactionCallbacks {
  burnExactAmountIn: (
    poolAmountIn: BigNumber,
    path: string[],
    minAmountOut: BigNumber
  ) => void;

  burnExactAmountOut: (
    poolAmountInMax: BigNumber,
    path: string[],
    tokenAmountOut: BigNumber
  ) => void;
}

export function useRoutedBurnTransactionCallbacks(indexPool: string): RoutedBurnTransactionCallbacks {
  const contract = useBurnRouterContract();
  const addTransaction = useAddTransactionCallback();
  const poolSymbol = usePoolSymbol(indexPool);

  const burnExactAmountIn = useCallback((
    poolAmountIn: BigNumber,
    path: string[],
    minAmountOut: BigNumber
  ) => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const args = [
      indexPool,
      convert.toHex(poolAmountIn),
      path,
      convert.toHex(minAmountOut),
    ];
    const tx = contract.burnExactAndSwapForTokens(...args);
    const displayAmount = convert.toBalance(poolAmountIn, 18, true, 3);
    const summary = `Burn ${displayAmount} ${poolSymbol}`;
    addTransaction(tx, { summary });
  }, [contract, indexPool, poolSymbol, addTransaction]);

  const burnExactAmountOut = useCallback((
    poolAmountInMax: BigNumber,
    path: string[],
    tokenAmountOut: BigNumber
  ) => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const args = [
      indexPool,
      convert.toHex(poolAmountInMax),
      path,
      convert.toHex(tokenAmountOut),
    ];
    const tx = contract.burnAndSwapForExactTokens(...args);
    const displayAmount = convert.toBalance(poolAmountInMax, 18, true, 3);
    const summary = `Burn up to ${displayAmount} ${poolSymbol}`;
    addTransaction(tx, { summary });
  }, [contract, indexPool, poolSymbol, addTransaction]);

  return { burnExactAmountIn, burnExactAmountOut };
}

interface BurnTransactionCallbacks {
  burnExactAmountIn: (
    outputTokenAddress: string,
    poolAmountIn: BigNumber,
    minAmountOut: BigNumber
  ) => void;

  burnExactAmountOut: (
    outputTokenAddress: string,
    tokenAmountOut: BigNumber,
    maxPoolAmountIn: BigNumber
  ) => void;
}

export function useBurnSingleTransactionCallbacks(poolAddress: string): BurnTransactionCallbacks {
  const contract = useIndexPoolContract(poolAddress);
  const addTransaction = useAddTransactionCallback();

  const burnExactAmountIn = useCallback((
    outputTokenAddress: string,
    poolAmountIn: BigNumber,
    minAmountOut: BigNumber
  ) => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const args = [
      outputTokenAddress,
      convert.toHex(poolAmountIn),
      convert.toHex(minAmountOut),
    ];
    const tx = contract.exitswapPoolAmountIn(...args);
    addTransaction(tx);
  }, [contract, addTransaction]);

  const burnExactAmountOut = useCallback((
    outputTokenAddress: string,
    tokenAmountOut: BigNumber,
    maxPoolAmountIn: BigNumber
  ) => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const args = [
      outputTokenAddress,
      convert.toHex(tokenAmountOut),
      convert.toHex(maxPoolAmountIn),
    ];
    const tx = contract.exitswapExternAmountOut(...args);
    addTransaction(tx);
  }, [contract, addTransaction]);

  return {
    burnExactAmountIn,
    burnExactAmountOut
  };
}

export interface StakingTransactionCallbacks {
  stake: (amount: string) => void;
  withdraw: (amount: string) => void;
  exit: () => void;
}

export function useStakingTransactionCallbacks(stakingPool: string): StakingTransactionCallbacks {
  const contract = useStakingRewardsContract(stakingPool);
  const addTransaction = useAddTransactionCallback();

  const stake = useCallback((amount: string) => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const tx = contract.stake(convert.toBigNumber(amount));
    addTransaction(tx);
  }, [ contract, addTransaction ])

  const withdraw = useCallback((amount: string) => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const tx = contract.withdraw(convert.toBigNumber(amount));
    addTransaction(tx);
  }, [ contract, addTransaction ])

  const exit = useCallback(() => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const tx = contract.exit();
    addTransaction(tx);
  }, [ contract, addTransaction ])

  return {
    stake,
    exit,
    withdraw
  }
}