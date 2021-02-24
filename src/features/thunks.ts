import * as topLevelActions from "./actions";
import { AppThunk } from "./store";
import { CoinGeckoService } from "services";
import { SUBGRAPH_URL_UNISWAP } from "config";
import { categoriesActions, indexPoolsActions, tokensActions } from "./models";
import { ethers } from "ethers";
import { helpers } from "ethereum";
import { settingsActions } from "./settings";
import selectors from "./selectors";

let provider: null | ethers.providers.Web3Provider = null;

const thunks = {
  /**
   *
   */
  initialize: (): AppThunk => async (dispatch) => {
    provider = new ethers.providers.Web3Provider(window.ethereum);

    const { chainId } = await provider.getNetwork();
    const url = helpers.getUrl(chainId);
    const initial = await helpers.queryInitial(url);
    const formatted = helpers.normalizeInitialData(initial);

    dispatch(actions.subgraphDataLoaded(formatted));
    dispatch(thunks.retrieveCoingeckoIds());
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

    if (pool) {
      const tokens = selectors.selectPoolUnderlyingTokens(state, poolId);
      const update = await helpers.poolUpdateMulticall(
        provider!,
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
   *
   */
  requestPoolDetail: (poolId: string): AppThunk => async (dispatch) => {
    dispatch(actions.retrieveCoingeckoData(poolId));
    dispatch(actions.requestPoolUpdate(poolId));
    dispatch(actions.requestPoolTradesAndSwaps(poolId));
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
