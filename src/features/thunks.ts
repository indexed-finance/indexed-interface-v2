import * as topLevelActions from "./actions";
import { BigNumber } from "bignumber.js";
import { CoinGeckoService } from "services";
import { SLIPPAGE_RATE, SUBGRAPH_URL_UNISWAP } from "config";
import { Trade } from "@uniswap/sdk";
import { batcherActions } from "./batcher";
import { categoriesActions } from "./categories";
import { convert } from "helpers";
import { ethers, providers } from "ethers";
import { helpers } from "ethereum";
import { indexPoolsActions } from "./indexPools";
import { multicall, taskHandlersByKind } from "ethereum/multicall";
import { settingsActions } from "./settings";
import { tokensActions } from "./tokens";
import { userActions } from "./user";
import debounce from "lodash.debounce";
import selectors from "./selectors";
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
  attachToProvider: (): AppThunk => async (dispatch) => {
    const ethereum = (window as any).ethereum;

    if (ethereum) {
      const [selectedAddress] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(ethereum, 1);

      dispatch(
        actions.initialize({
          provider,
          selectedAddress,
          withSigner: true,
        })
      );
    }
  },
  /**
   *
   */
  initialize: (options: InitialzeOptions): AppThunk => async (
    dispatch,
    getState
  ) => {
    let selectedAddress = "";

    provider = options.provider;

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
  changeBlockNumber: (blockNumber: number): AppThunk => async (dispatch) => {
    dispatch(actions.blockNumberChanged(blockNumber));
    dispatch(thunks.sendBatch());
  },
  /**
   *
   */
  retrieveInitialData: (): AppThunk => async (dispatch) => {
    if (provider) {
      const { chainId } = provider.network;
      const url = helpers.getUrl(chainId);
      const initial = await helpers.queryInitial(url);
      const formatted = helpers.normalizeInitialData(initial);

      dispatch(actions.subgraphDataLoaded(formatted));
    }
  },
  /**
   *
   */
  retrieveCoingeckoIds: (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const tokenDictionary = selectors
      .selectTokenSymbols(state)
      .reduce((prev, next) => {
        prev[next.toLowerCase()] = true;
        return prev;
      }, {} as Record<string, true>);
    const allSupportedCoins = await CoinGeckoService.getSupportedTokens();
    const relevantSupportedCoins = allSupportedCoins.filter(
      (coin: any) => tokenDictionary[coin.symbol.toLowerCase()]
    );
    const supportedCoinIds = relevantSupportedCoins.map(
      ({ id, symbol }: any) => ({
        id,
        symbol,
      })
    );

    dispatch(actions.coingeckoIdsLoaded(supportedCoinIds));
  },
  /**
   *
   */
  retrieveCoingeckoData: (poolId: string): AppThunk => async (
    dispatch,
    getState
  ) => {
    const state = getState();
    const tokenIds = selectors.selectPoolTokenIds(state, poolId);
    const tokenLookup = selectors.selectTokenLookup(state);
    const relevantTokenAddresses = tokenIds.filter((id) => tokenLookup[id]);
    const coingeckoData = await CoinGeckoService.getStatsForTokens(
      relevantTokenAddresses
    );

    dispatch(actions.coingeckoDataLoaded(coingeckoData));
  },
  registerPoolUpdateListener: (poolId: string): AppThunk => (
    dispatch,
    getState
  ) => {
    const state = getState();
    const tokens = selectors.selectPoolUnderlyingTokens(state, poolId);

    return dispatch(
      actions.listenerRegistered({
        id: "",
        kind: "PoolData",
        args: {
          pool: poolId,
          tokens: tokens.map((t) => t.token.id),
        },
      })
    );
  },
  registerPairReservesDataListener: (pairs: string[]): AppThunk => (
    dispatch
  ) => {
    return dispatch(
      actions.listenerRegistered({
        id: "",
        kind: "UniswapPairsData",
        args: pairs,
      })
    );
  },
  requestPoolTradesAndSwaps: (poolId: string): AppThunk => async (dispatch) => {
    if (provider) {
      const { chainId } = await provider.getNetwork();
      const url = helpers.getUrl(chainId);
      const [trades, swaps] = await Promise.all([
        helpers.queryTrades(SUBGRAPH_URL_UNISWAP, poolId),
        helpers.querySwaps(url, poolId),
      ]);

      dispatch(actions.poolTradesAndSwapsLoaded({ poolId, trades, swaps }));
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
        await helpers.approveSpender(
          signer,
          spenderAddress,
          tokenAddress,
          exactAmount
        );
      } catch (err) {
        // Handle failed approval.
        console.log(err);
      }
    }
  },
  trade: (trade: Trade): AppThunk => async (_, getState) => {
    const state = getState();
    if (signer) {
      const userAddress = selectors.selectUserAddress(state);
      await helpers.executeUniswapTrade(signer, userAddress, trade);
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
      await helpers.swapExactAmountIn(
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
      await helpers.swapExactAmountOut(
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
        output = helpers.downwardSlippage(output, SLIPPAGE_RATE);
      } else {
        input = helpers.upwardSlippage(input, SLIPPAGE_RATE);
      }
      const { id: inputAddress } = tokensBySymbol[inputTokenSymbol];
      const { id: outputAddress } = tokensBySymbol[outputTokenSymbol];

      if (inputAddress && outputAddress) {
        const swapper =
          specifiedSide === "input"
            ? helpers.swapExactAmountIn
            : helpers.swapExactAmountOut;

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
  sendBatch: (): AppThunk => async (dispatch, getState) => {
    if (provider) {
      const state = getState();
      const account = selectors.selectUserAddress(state);
      const context = { state, dispatch, actions, account, selectors };

      const { calls, counts, tasks } = selectors.selectBatch(state);
      const { blockNumber, results: allResults } = await multicall(
        provider,
        calls
      );

      let resultIndex = 0;
      for (const task of tasks) {
        const { index, count } = counts[resultIndex++];
        const results = allResults.slice(index, index + count);
        taskHandlersByKind[task.kind].handleResults(context, task.args, {
          blockNumber,
          results,
        });
      }
    }
  },
};

const actions = {
  ...batcherActions,
  ...categoriesActions,
  ...indexPoolsActions,
  ...settingsActions,
  ...tokensActions,
  ...userActions,
  ...topLevelActions,
  ...thunks,
};

export type ActionType = typeof actions;

export default actions;
