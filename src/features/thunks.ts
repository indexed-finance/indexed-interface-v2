import * as topLevelActions from "./actions";
import { AppThunk } from "./store";
import { BigNumber } from "bignumber.js";
import { CoinGeckoService } from "services";
import { SLIPPAGE_RATE, SUBGRAPH_URL_UNISWAP } from "config";
import { categoriesActions } from "./categories";
import { convert } from "helpers";
import { ethers } from "ethers";
import { helpers } from "ethereum";
import { indexPoolsActions } from "./indexPools";
import { settingsActions } from "./settings";
import { tokensActions } from "./tokens";
import selectors from "./selectors";

export let selectedAddress = "";
export let socketProvider: null | ethers.providers.WebSocketProvider = null;
export let basicProvider: null | ethers.providers.JsonRpcProvider = null;
export let signer: null | ethers.providers.JsonRpcSigner = null;
export let genericProvider:
  | null
  | ethers.providers.WebSocketProvider
  | ethers.providers.JsonRpcProvider = null;

const thunks = {
  /**
   *
   */
  initialize: (
    withSelectedAddress?: string,
    withBasicProvider?: null | ethers.providers.JsonRpcProvider,
    withSocketProvider?: null | ethers.providers.WebSocketProvider
  ): AppThunk => async (dispatch) => {
    selectedAddress = withSelectedAddress ?? "";

    if (!(withBasicProvider || withSocketProvider)) {
      throw new Error(
        "This dapplication cannot initialize without some form of provider."
      );
    }

    if (withBasicProvider) {
      await withBasicProvider.ready;

      basicProvider = withBasicProvider;
      signer = basicProvider.getSigner();
    }

    if (withSocketProvider) {
      await withSocketProvider.ready;

      socketProvider = withSocketProvider;
    }

    const providerToUse = socketProvider ?? basicProvider;

    if (providerToUse) {
      const { chainId } = providerToUse._network;
      const url = helpers.getUrl(chainId);
      const initial = await helpers.queryInitial(url);
      const formatted = helpers.normalizeInitialData(initial);

      genericProvider = providerToUse;

      dispatch(actions.subgraphDataLoaded(formatted));
      dispatch(thunks.retrieveCoingeckoIds());
    } else {
      // --
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
  /**
   *
   */
  requestPoolUpdate: (poolId: string): AppThunk => async (
    dispatch,
    getState
  ) => {
    const state = getState();
    const pool = selectors.selectPool(state, poolId);

    if (pool && genericProvider) {
      const tokens = selectors.selectPoolUnderlyingTokens(state, poolId);
      const update = await helpers.poolUpdateMulticall(
        genericProvider,
        poolId,
        tokens
      );

      dispatch(
        actions.poolUpdated({
          pool,
          update,
        })
      );
    }
  },
  /**
   *
   */
  requestPoolTradesAndSwaps: (poolId: string): AppThunk => async (dispatch) => {
    if (genericProvider) {
      const { chainId } = genericProvider._network;
      const url = helpers.getUrl(chainId);
      const [trades, swaps] = await Promise.all([
        helpers.queryTrades(SUBGRAPH_URL_UNISWAP, poolId),
        helpers.querySwaps(url, poolId),
      ]);

      dispatch(actions.poolTradesAndSwapsLoaded({ poolId, trades, swaps }));
    }
  },
  /**
   *
   * @param poolId -
   */
  requestPoolUserData: (poolId: string): AppThunk => async (
    dispatch,
    getState
  ) => {
    if (genericProvider) {
      const state = getState();
      const sourceAddress =
        selectedAddress ?? (await genericProvider.listAccounts())[0];
      const destinationAddress = poolId;
      const tokens = selectors.selectPoolUnderlyingTokens(state, poolId);

      if (sourceAddress && destinationAddress) {
        const userData = await helpers.tokenUserDataMulticall(
          genericProvider,
          sourceAddress,
          destinationAddress,
          tokens
        );

        dispatch(
          actions.poolUserDataLoaded({
            poolId,
            userData,
          })
        );
      }
    }
  },
  /**
   *
   */
  requestPoolDetail: (
    poolId: string,
    includeUserData = true
  ): AppThunk => async (dispatch) => {
    dispatch(actions.retrieveCoingeckoData(poolId));
    // dispatch(actions.requestPoolUpdate(poolId));
    dispatch(actions.requestPoolTradesAndSwaps(poolId));

    if (includeUserData) {
      dispatch(actions.requestPoolUserData(poolId));
    }
  },
  /**
   *
   */
  approvePool: (
    poolAddress: string,
    tokenSymbol: string,
    amount: string
  ): AppThunk => async (_, getState) => {
    const state = getState();
    const tokensBySymbol = selectors.selectTokenLookupBySymbol(state);
    const tokenAddress = tokensBySymbol[tokenSymbol]?.id ?? "";

    if (signer && tokenAddress) {
      try {
        await helpers.approvePool(signer, poolAddress, tokenAddress, amount);
      } catch {
        // Handle failed approval.
      }
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
      const slippageFunction =
        specifiedSide === "input"
          ? helpers.downwardSlippage
          : helpers.upwardSlippage;
      const minimumAmount = slippageFunction(
        convert.toToken(outputAmount),
        SLIPPAGE_RATE
      );
      const [input, output] = [inputAmount, outputAmount].map((which) =>
        convert.toHex(convert.toToken(which.toString()))
      );
      const { id: inputAddress } = tokensBySymbol[inputTokenSymbol];
      const { id: outputAddress } = tokensBySymbol[outputTokenSymbol];

      if (inputAddress && outputAddress) {
        if (specifiedSide === "input") {
          await helpers.swapExactAmountIn(
            signer,
            poolAddress,
            inputAddress,
            outputAddress,
            input,
            minimumAmount,
            maximumPrice
          );
        } else {
          await helpers.swapExactAmountOut(
            signer,
            poolAddress,
            inputAddress,
            outputAddress,
            input,
            output,
            maximumPrice
          );
        }
      } else {
        // --
      }
    }
  },
};

const actions = {
  ...categoriesActions,
  ...indexPoolsActions,
  ...settingsActions,
  ...tokensActions,
  ...topLevelActions,
  ...thunks,
};

export default actions;
