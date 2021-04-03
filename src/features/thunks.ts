import * as topLevelActions from "./actions";
import { BigNumber } from "bignumber.js";
import { RegisteredCall, convert } from "helpers";
import { SLIPPAGE_RATE } from "config";
import {
  approveSpender,
  burnAndSwapForExactTokens,
  burnExactAndSwapForTokens,
  downwardSlippage,
  exitswapExternAmountOut,
  exitswapPoolAmountIn,
  joinPool,
  joinswapExternAmountIn,
  joinswapPoolAmountOut,
  swapExactAmountIn,
  swapExactAmountOut,
  swapExactTokensForTokensAndMint,
  swapTokensForTokensAndMintExact,
  upwardSlippage,
} from "ethereum";
import { batcherActions } from "./batcher";
import { categoriesActions } from "./categories";
import {
  fetchInitialData,
  fetchMulticallData,
  fetchPoolTradesSwaps,
  fetchStakingData,
  fetchTokenStats,
} from "./requests";
import { indexPoolsActions } from "./indexPools";
import { pairsActions } from "./pairs";
import { providers } from "ethers";
import { selectors } from "./selectors";
import { settingsActions } from "./settings";
import { stakingActions } from "./staking";
import { tokensActions } from "./tokens";
import { userActions } from "./user";
import debounce from "lodash.debounce";
import type { AppThunk } from "./store";

// #region Provider
/**
 * A global reference to the provider (always) and signer (for end users) is established
 * and is accessible elsewhere.
 */
export let provider:
  | null
  | providers.Web3Provider
  | providers.JsonRpcProvider
  | providers.InfuraProvider = null;
export let signer: null | providers.JsonRpcSigner = null;

export const disconnectFromProvider = () => {
  provider = null;
  signer = null;
};

export function useProvider() {
  return [provider, signer];
}

export function useSigner() {
  const [, signer] = useProvider();

  return signer ?? null;
}
// #endregion

type InitialzeOptions = {
  provider:
    | providers.Web3Provider
    | providers.JsonRpcProvider
    | providers.InfuraProvider;
  withSigner?: boolean;
  selectedAddress?: string;
};

/**
 * Since the handler can fire multiple times in quick succession,
 * we need to batch the calls to avoid unnecessary updates.
 */
const BLOCK_HANDLER_DEBOUNCE_RATE = 250;

export const thunks = {
  /**
   *
   */
  initialize: (options: InitialzeOptions): AppThunk => async (
    dispatch,
    getState
  ) => {
    let selectedAddress = "";

    provider = options.provider;

    if (provider.blockNumber !== -1) {
      dispatch(actions.blockNumberChanged(provider.blockNumber));
    }

    if (options.withSigner) {
      signer = provider.getSigner();

      if (options.selectedAddress) {
        selectedAddress = options.selectedAddress;
      } else if (provider.connection.url === "metamask") {
        selectedAddress = (provider as any).provider.selectedAddress;
      } else {
        throw new Error("Unable to initialize without a selected address.");
      }
    }

    await provider.ready;

    dispatch(
      fetchInitialData({
        provider,
      })
    );
    dispatch(
      fetchStakingData({
        provider,
      })
    );

    if (selectedAddress) {
      dispatch(actions.userAddressSelected(selectedAddress));
    }

    /**
     * When the block number changes,
     * change the state so that batcher may process.
     */
    const debouncedBlockHandler = debounce((blockNumber) => {
      const blockNumberAtThisTime = selectors.selectBlockNumber(getState());

      if (blockNumber !== blockNumberAtThisTime) {
        dispatch(thunks.changeBlockNumber(blockNumber));
      }
    }, BLOCK_HANDLER_DEBOUNCE_RATE);

    provider.addListener("block", debouncedBlockHandler);
  },
  /**
   *
   */
  changeBlockNumber: (blockNumber: number): AppThunk => async (
    dispatch,
    getState
  ) => {
    const initialBlockNumber = selectors.selectBlockNumber(getState());

    dispatch(actions.blockNumberChanged(blockNumber));

    if (initialBlockNumber !== -1) {
      dispatch(thunks.sendBatch());
    }
  },
  /**
   *
   */
  sendBatch: (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const { status } = selectors.selectBatcherStatus(state);

    if (status === "idle") {
      const batch = selectors.selectBatch(state);

      if (provider) {
        dispatch(
          fetchMulticallData({
            provider,
            arg: batch,
          })
        );

        for (const call of batch.offChainCalls) {
          const [fn, args] = call.split("/");
          const request = {
            fetchInitialData,
            fetchMulticallData,
            fetchPoolTradesSwaps,
            fetchTokenStats,
          }[fn] as any;

          if (request) {
            dispatch(
              request({
                provider,
                arg: [...args.split("_")],
              })
            );
          }
        }
      }
    }
  },

  // Interactions

  /**
   * @param spenderAddress - Address of the spender to approve
   * @param tokenAddress - ERC20 token address
   * @param exactAmount - Exact amount of tokens to allow spender to transfer
   */
  approveSpender: (
    spenderAddress: string,
    tokenAddress: string,
    exactAmount: string
  ): AppThunk => async () => {
    if (signer && tokenAddress) {
      try {
        await approveSpender(signer, spenderAddress, tokenAddress, exactAmount);
      } catch (err) {
        // Handle failed approval.
        console.error(err);
      }
    }
  },
  joinswapExternAmountIn: (
    indexPool: string,
    tokenIn: string,
    amountIn: BigNumber,
    minPoolAmountOut: BigNumber
  ): AppThunk => async () => {
    if (signer) {
      await joinswapExternAmountIn(
        signer,
        indexPool,
        tokenIn,
        amountIn,
        minPoolAmountOut
      );
    }
  },
  joinswapPoolAmountOut: (
    indexPool: string,
    tokenIn: string,
    poolAmountOut: BigNumber,
    maxAmountIn: BigNumber
  ): AppThunk => () => {
    if (signer) {
      joinswapPoolAmountOut(
        signer,
        indexPool,
        tokenIn,
        poolAmountOut,
        maxAmountIn
      );
    }
  },
  joinPool: (
    indexPool: string,
    poolAmountOut: BigNumber,
    maxAmountsIn: BigNumber[]
  ): AppThunk => async () => {
    if (signer) {
      await joinPool(signer, indexPool, poolAmountOut, maxAmountsIn);
    }
  },
  exitswapPoolAmountIn: (
    indexPool: string,
    tokenOut: string,
    poolAmountIn: BigNumber,
    minAmountOut: BigNumber
  ): AppThunk => async () => {
    if (signer) {
      await exitswapPoolAmountIn(
        signer,
        indexPool,
        tokenOut,
        poolAmountIn,
        minAmountOut
      );
    }
  },
  exitswapExternAmountOut: (
    indexPool: string,
    tokenOut: string,
    tokenAmountOut: BigNumber,
    maxPoolAmountIn: BigNumber
  ): AppThunk => async () => {
    if (signer) {
      await exitswapExternAmountOut(
        signer,
        indexPool,
        tokenOut,
        tokenAmountOut,
        maxPoolAmountIn
      );
    }
  },
  swapTokensForTokensAndMintExact: (
    indexPool: string,
    maxAmountIn: BigNumber,
    path: string[],
    poolAmountOut: BigNumber
  ): AppThunk => async () => {
    if (signer) {
      await swapTokensForTokensAndMintExact(
        signer,
        indexPool,
        maxAmountIn,
        path,
        poolAmountOut
      );
    }
  },
  swapExactTokensForTokensAndMint: (
    indexPool: string,
    amountIn: BigNumber,
    path: string[],
    minPoolAmountOut: BigNumber
  ): AppThunk => async () => {
    if (signer) {
      await swapExactTokensForTokensAndMint(
        signer,
        indexPool,
        amountIn,
        path,
        minPoolAmountOut
      );
    }
  },
  burnExactAndSwapForTokens: (
    indexPool: string,
    poolAmountIn: BigNumber,
    path: string[],
    minAmountOut: BigNumber
  ): AppThunk => async () => {
    if (signer) {
      await burnExactAndSwapForTokens(
        signer,
        indexPool,
        poolAmountIn,
        path,
        minAmountOut
      );
    }
  },
  burnAndSwapForExactTokens: (
    indexPool: string,
    poolAmountInMax: BigNumber,
    path: string[],
    tokenAmountOut: BigNumber
  ): AppThunk => async () => {
    if (signer) {
      await burnAndSwapForExactTokens(
        signer,
        indexPool,
        poolAmountInMax,
        path,
        tokenAmountOut
      );
    }
  },
  /**
   *
   */
  swap: (
    poolAddress: string,
    specifiedSide: "input" | "output",
    inputAmount: string,
    inputTokenSymbol: string,
    outputAmount: string,
    outputTokenSymbol: string,
    maximumPrice: BigNumber
  ): AppThunk => async (_, getState) => {
    if (signer) {
      const state = getState();
      const tokensBySymbol = selectors.selectTokenLookupBySymbol(state);

      let [input, output] = [inputAmount, outputAmount].map(convert.toToken);

      if (specifiedSide === "input") {
        output = downwardSlippage(output, SLIPPAGE_RATE);
      } else {
        input = upwardSlippage(input, SLIPPAGE_RATE);
      }
      const { id: inputAddress } = tokensBySymbol[inputTokenSymbol];
      const { id: outputAddress } = tokensBySymbol[outputTokenSymbol];

      if (inputAddress && outputAddress) {
        const swapper =
          specifiedSide === "input" ? swapExactAmountIn : swapExactAmountOut;

        await swapper(
          signer,
          poolAddress,
          inputAddress,
          outputAddress,
          input,
          output,
          maximumPrice
        );
      } else {
        // --
      }
    }
  },
};

export const actions = {
  ...batcherActions,
  ...categoriesActions,
  ...indexPoolsActions,
  ...pairsActions,
  ...settingsActions,
  ...stakingActions,
  ...tokensActions,
  ...userActions,
  ...topLevelActions,
  ...thunks,
};

export type ActionType = typeof actions;

export type DataReceiverConfig = {
  caller: string;
  onChainCalls?: RegisteredCall[];
  offChainCalls?: RegisteredCall[];
};
