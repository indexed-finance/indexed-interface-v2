import { INFURA_ID } from "config";
import {
  RegisteredCall,
  actions,
  createPoolDetailCalls,
  selectors,
  store,
} from "features";
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
    setupRegistrants();
  }
});

function setupRegistrants() {
  const state = getState();
  const pools = selectors.selectAllPools(state);
  const allCalls = pools.reduce(
    (prev, next) => {
      const { id } = next;
      const tokenIds = selectors.selectPoolTokenIds(state, id);
      const { onChainCalls, offChainCalls } = createPoolDetailCalls(
        id,
        tokenIds
      );

      prev.onChainCalls.push(...onChainCalls);
      prev.offChainCalls.push(...(offChainCalls as RegisteredCall[]));

      return prev;
    },
    {
      caller: "Socket Server",
      onChainCalls: [],
      offChainCalls: [],
    } as {
      caller: string;
      onChainCalls: RegisteredCall[];
      offChainCalls: RegisteredCall[];
    }
  );

  dispatch(actions.registrantRegistered(allCalls));
}
