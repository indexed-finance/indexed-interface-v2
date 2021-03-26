import { INFURA_ID } from "config";
import {
  RegisteredCall,
  RegisteredCaller,
  actions,
  createPairDataCalls,
  createPoolDetailCalls,
  createStakingCalls,
  createTotalSuppliesCalls,
  selectors,
  store,
} from "features";
import { buildUniswapPairs } from "hooks";
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

  dispatch(actions.requestStakingData());
}

/**
 * As soon as the store has all relevant symbols,
 * pass the symbols to the CoinAPI connection to begin receiving updates.
 */
let relevantSymbols: string[] = [];
const unsubscribeFromWaitingForSymbols = subscribe(() => {
  const state = getState();
  const pools = selectors.selectAllPools(state);
  const stakingPools = selectors.selectAllStakingPools(state);
  const symbols = selectors.selectTokenSymbols(state);

  if (pools.length > 0 && stakingPools.length > 0 && symbols.length > 0) {
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
  const stakingPools = selectors.selectAllStakingPools(state);
  const { pairDataCalls, poolDetailCalls, totalSuppliesCalls } = pools.reduce(
    (prev, next) => {
      const { id } = next;
      const tokenIds = selectors.selectPoolTokenIds(state, id);
      const pairs = buildUniswapPairs(tokenIds);
      const pairDataCalls = createPairDataCalls(pairs);
      const poolDetailCalls = createPoolDetailCalls(id, tokenIds);
      const totalSuppliesCalls = createTotalSuppliesCalls(tokenIds);

      prev.pairDataCalls.onChainCalls = pairDataCalls;
      prev.poolDetailCalls.onChainCalls = poolDetailCalls.onChainCalls;
      prev.poolDetailCalls.offChainCalls = poolDetailCalls.offChainCalls as RegisteredCall[];
      prev.totalSuppliesCalls.onChainCalls = totalSuppliesCalls;

      return prev;
    },
    {
      pairDataCalls: {
        caller: "Pair Data",
        onChainCalls: [],
        offChainCalls: [],
      },
      poolDetailCalls: {
        caller: "Pool Data",
        onChainCalls: [],
        offChainCalls: [],
      },
      totalSuppliesCalls: {
        caller: "Total Supplies",
        onChainCalls: [],
        offChainCalls: [],
      },
    } as {
      pairDataCalls: RegisteredCaller;
      poolDetailCalls: RegisteredCaller;
      totalSuppliesCalls: RegisteredCaller;
    }
  );

  dispatch(actions.registrantRegistered(pairDataCalls));
  dispatch(actions.registrantRegistered(poolDetailCalls));
  dispatch(actions.registrantRegistered(totalSuppliesCalls));

  const stakingCalls = stakingPools.reduce(
    (prev, next) => {
      const { id, stakingToken } = next;
      const stakingCalls = createStakingCalls(id, stakingToken);

      prev.onChainCalls.push(...stakingCalls.onChainCalls);
      prev.offChainCalls.push(
        ...(stakingCalls.offChainCalls as RegisteredCall[])
      );

      return prev;
    },
    {
      caller: "Staking",
      onChainCalls: [],
      offChainCalls: [],
    } as RegisteredCaller
  );

  dispatch(actions.registrantRegistered(stakingCalls));
}
