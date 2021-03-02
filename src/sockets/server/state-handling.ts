import { INFURA_ID, SERVER_POLL_RATE } from "config";
import { actions, selectors, store } from "features";
import { log } from "./helpers";
import { providers } from "ethers";
import setupCoinapiConnection from "./coinapi-connection";

// The same provider is used for the lifetime of the server.
const { dispatch, getState, subscribe } = store;
const provider = new providers.InfuraProvider("mainnet", INFURA_ID);

/**
 * After creating the connection, allow it to update before initializing the store.
 */
export default async function setupStateHandling() {
  log("Waiting for provider.");

  await provider.ready;

  log("Provider ready. Initializing.");

  dispatch(
    actions.initialize({
      provider,
      withSigner: false,
    })
  );
}

/**
 * As soon as the store has all relevant symbols,
 * pass the symbols to the CoinAPI connection to begin receiving updates.
 */
let relevantSymbols: string[] = [];
const unsubscribeFromWaitingForSymbols = subscribe(() => {
  const state = getState();
  const pools = selectors.selectAllPools(state);
  const symbols = selectors.selectTokenSymbols(state);

  if (pools.length > 0 && symbols.length > 0) {
    log("Pools and tokens have loaded.");

    relevantSymbols = symbols;

    unsubscribeFromWaitingForSymbols();
    setupCoinapiConnection(relevantSymbols);
    continuouslyRetrievePoolDetails();
  }
});

/**
 * Every so often, re-fetch thegraph and pool data.
 */
function continuouslyRetrievePoolDetails() {
  setTimeout(() => {
    const state = getState();
    const pools = selectors.selectAllPools(state);

    dispatch(actions.retrieveInitialData());

    for (const pool of pools) {
      dispatch(actions.requestPoolDetail(pool.id, false));
    }

    continuouslyRetrievePoolDetails();
  }, SERVER_POLL_RATE);
}
