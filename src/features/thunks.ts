import * as coingeckoQueries from "helpers/coingecko-queries";
import * as supgraphQueries from "helpers/subgraph-queries";
import * as topLevelActions from "./actions";
import { BigNumber } from "bignumber.js";
import { RegisteredCall, convert } from "helpers";
import { SLIPPAGE_RATE, SUBGRAPH_URL_UNISWAP } from "config";
import { Trade } from "@uniswap/sdk";
import {
  approveSpender,
  burnAndSwapForExactTokens,
  burnExactAndSwapForTokens,
  downwardSlippage,
  executeUniswapTrade,
  exitswapExternAmountOut,
  exitswapPoolAmountIn,
  joinPool,
  joinswapExternAmountIn,
  joinswapPoolAmountOut,
  multicall,
  normalizeInitialData,
  normalizeStakingData,
  swapExactAmountIn,
  swapExactAmountOut,
  swapExactTokensForTokensAndMint,
  swapTokensForTokensAndMintExact,
  upwardSlippage,
} from "ethereum";
import { batcherActions } from "./batcher";
import { cacheActions } from "./cache";
import { categoriesActions } from "./categories";
import { ethers, providers } from "ethers";
import { indexPoolsActions } from "./indexPools";
import { notification } from "antd";
import { selectors } from "./selectors";
import { settingsActions } from "./settings";
import { stakingActions } from "./staking";
import { tokensActions } from "./tokens";
import { userActions } from "./user";
import debounce from "lodash.debounce";
import type { AppThunk } from "./store";
import type { Swap as PoolSwap } from "indexed-types";
import type { Swap as PoolTrade } from "uniswap-types";

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
      dispatch(actions.cachePurged());
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

    dispatch(thunks.retrieveInitialData());

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
      dispatch(thunks.triggerBatchDump());
    }
  },
  /**
   *
   */
  triggerBatchDump: (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const { status } = selectors.selectBatcherStatus(state);

    if (status === "idle") {
      const cachedCalls = selectors.selectCachedCallsFromCurrentBlock(state);
      const batch = selectors.selectBatch(state, cachedCalls);

      for (const call of batch.offChainCalls) {
        const [fn, args] = call.split("/");
        const action = (thunks as any)[fn];

        if (action) {
          dispatch(action(...args.split("_")));
        }
      }

      if (provider) {
        try {
          dispatch(actions.multicallDataRequested());

          const { blockNumber, results } = await multicall(
            provider,
            batch.onChainCalls.deserializedCalls
          );
          const formattedMulticallData = formatMulticallData(
            batch,
            blockNumber,
            results
          );

          dispatch(actions.multicallDataReceived(formattedMulticallData));
        } catch (error) {
          console.error(error);
          dispatch(actions.multicallFailed());
        }
      }
    }
  },
  /**
   *
   */
  retrieveInitialData: (): AppThunk => async (dispatch) => {
    if (provider) {
      const { chainId } = provider.network;
      const url = supgraphQueries.getUrl(chainId);
      const initial = await supgraphQueries.queryInitial(url);
      const formatted = normalizeInitialData(initial);

      dispatch(actions.subgraphDataLoaded(formatted));
    }

    dispatch(actions.requestStakingData());
  },
  requestTokenStats: (...tokenIds: string[]): AppThunk => async (
    dispatch,
    getState
  ) => {
    const state = getState();
    const canRequest = selectors.selectTokenStatsRequestable(state);
    const ids = typeof tokenIds === "string" ? [tokenIds] : tokenIds;

    if (canRequest) {
      try {
        const tokens = await coingeckoQueries.getStatsForTokens(ids);

        if (tokens) {
          dispatch(actions.tokenStatsDataLoaded(tokens));
        }
      } catch {
        const tx = selectors.selectTranslator(state);

        dispatch(actions.tokenStatsRequestFailed({ when: Date.now() }));

        notification.error({
          message: tx("ERROR"),
          description: tx("THERE_WAS_A_PROBLEM_LOADING_DATA_FROM_COINGECKO"),
        });
      }
    }
  },
  /**
   *
   * @param poolAddress -
   * @returns
   */
  requestPoolTradesAndSwaps: (...poolAddresses: string[]): AppThunk => async (
    dispatch
  ) => {
    if (provider) {
      const { chainId } = await provider.getNetwork();
      const url = supgraphQueries.getUrl(chainId);
      const [trades, swaps] = await Promise.all([
        supgraphQueries.queryTradesForPools(
          SUBGRAPH_URL_UNISWAP,
          poolAddresses
        ),
        supgraphQueries.querySwapsForPools(url, poolAddresses),
      ]);
      const formattedTradesAndSwaps = poolAddresses.reduce(
        (prev, next) => {
          prev[next] = {
            trades: trades[next],
            swaps: swaps[next],
          };

          return prev;
        },
        {} as Record<
          string,
          {
            trades: PoolTrade[];
            swaps: PoolSwap[];
          }
        >
      );

      dispatch(actions.poolTradesAndSwapsLoaded(formattedTradesAndSwaps));
    }
  },
  /**
   *
   * @returns
   */
  requestStakingData: (): AppThunk => async (dispatch) => {
    if (provider) {
      const { chainId } = provider.network;
      const url = supgraphQueries.getUrl(chainId);
      const staking = await supgraphQueries.queryStaking(url);
      const formatted = normalizeStakingData(staking);

      dispatch(actions.stakingDataLoaded(formatted));
    }
  },
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
  trade: (trade: Trade): AppThunk => async (_, getState) => {
    const state = getState();
    if (signer) {
      const userAddress = selectors.selectUserAddress(state);
      await executeUniswapTrade(signer, userAddress, trade);
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
  swapExactAmountIn: (
    indexPool: string,
    tokenIn: string,
    amountIn: BigNumber,
    tokenOut: string,
    minAmountOut: BigNumber,
    maximumPrice: BigNumber
  ): AppThunk => async () => {
    if (signer) {
      await swapExactAmountIn(
        signer,
        indexPool,
        tokenIn,
        tokenOut,
        amountIn,
        minAmountOut,
        maximumPrice
      );
    }
  },
  swapExactAmountOut: (
    indexPool: string,
    tokenIn: string,
    maxAmountIn: BigNumber,
    tokenOut: string,
    amountOut: BigNumber,
    maximumPrice: BigNumber
  ): AppThunk => async () => {
    if (signer) {
      await swapExactAmountOut(
        signer,
        indexPool,
        tokenIn,
        tokenOut,
        maxAmountIn,
        amountOut,
        maximumPrice
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
  ...cacheActions,
  ...categoriesActions,
  ...indexPoolsActions,
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

// #region Helpers
export function formatMulticallData(
  batch: ReturnType<typeof selectors.selectBatch>,
  blockNumber: number,
  results: ethers.utils.Result[]
) {
  const { callers, onChainCalls } = batch;
  const { registrars, callsByRegistrant } = onChainCalls;
  const callsToResults = registrars.reduce((prev, next) => {
    prev[next] = [];
    return prev;
  }, {} as Record<string, string[]>);

  let previousCutoff = 0;
  for (const registrar of registrars) {
    const callCount = callsByRegistrant[registrar].length;
    const relevantResults = results.slice(
      previousCutoff,
      previousCutoff + callCount
    );

    let index = 0;
    for (const callResult of relevantResults) {
      const call = callsByRegistrant[registrar][index];
      const formattedResults = callResult.map((bn) =>
        bn.toString()
      ) as string[];

      callsToResults[call].push(...formattedResults);

      index++;
    }

    previousCutoff += callCount;
  }

  return {
    blockNumber,
    callers,
    callsToResults,
  };
}
// #endregion
