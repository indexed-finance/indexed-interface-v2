import { INFURA_ID } from "config";
import {
  TOKEN_PRICES_CALLER,
  buildUniswapPairs,
  createPairDataCalls,
  createPoolDetailCalls,
  createStakingCalls,
  createTotalSuppliesCalls,
} from "hooks";
import { actions, requests, selectors, store } from "features";
import { createNewStakingCalls } from "hooks/new-staking-hooks";
import { log } from "./helpers";
import { providers } from "ethers";
import type { RegisteredCall, RegisteredCaller } from "helpers";

// The same provider is used for the lifetime of the server.
const { dispatch, getState, subscribe } = store;
const provider = new providers.InfuraProvider("mainnet", INFURA_ID);

/**
 * After creating the connection, allow it to update before initializing the store.
 */
export async function setupStateHandling() {
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
const unsubscribeFromWaitingForSymbols = subscribe(() => {
  const state = getState();
  const indexPools = selectors.selectAllPools(state);
  const stakingPools = selectors.selectAllStakingPools(state);
  const symbols = selectors.selectTokenSymbols(state);

  if (indexPools.length > 0 && stakingPools.length > 0 && symbols.length > 0) {
    unsubscribeFromWaitingForSymbols();
    setupRegistrants();
  }
});

const BLOCKS_PER_DAY = 86400 / 13.5;

function setupRegistrants() {
  const state = getState();
  const indexPools = selectors.selectAllPools(state);
  const stakingPools = selectors.selectAllStakingPools(state);
  const newStakingPools = selectors.selectAllNewStakingPools(state);
  const newStakingMeta = selectors.selectNewStakingMeta(state);
  const allTokens = selectors.selectAllTokens(state);
  const allTokenIds = allTokens.map(t => t.id);
  const pairs = buildUniswapPairs(allTokenIds);
  dispatch(actions.uniswapPairsRegistered(pairs));
  const pairDataCalls = {
    caller: "Pair Data",
    onChainCalls: createPairDataCalls(pairs),
    offChainCalls: [],
  };
  const tokenPriceCalls = {
    caller: TOKEN_PRICES_CALLER,
    onChainCalls: [],
    offChainCalls: [
      {
        target: "",
        function: "fetchTokenPriceData",
        args: allTokenIds,
        canBeMerged: true,
      },
    ],
  }
  const { poolDetailCalls, totalSuppliesCalls } =
    indexPools.reduce(
      (prev, next) => {
        const { id } = next;
        const tokenIds = selectors.selectPoolTokenIds(state, id);

        const poolDetailCalls = createPoolDetailCalls(id, tokenIds);
        prev.poolDetailCalls.onChainCalls.push(...poolDetailCalls.onChainCalls);
        prev.poolDetailCalls.offChainCalls.push(
          ...(poolDetailCalls.offChainCalls as RegisteredCall[])
        );

        const totalSuppliesCalls = createTotalSuppliesCalls(allTokenIds);
        prev.totalSuppliesCalls.onChainCalls.push(...totalSuppliesCalls);

        return prev;
      },
    {
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
        poolDetailCalls: RegisteredCaller;
        totalSuppliesCalls: RegisteredCaller;
      }
    );
  const fromBlock = newStakingPools.sort((a, b) => b.lastRewardBlock - a.lastRewardBlock)[0].lastRewardBlock;
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
  const newStakingCalls = newStakingPools.reduce(
    (prev, next) => {
      const { id, token } = next;
      const newStakingCalls = createNewStakingCalls(newStakingMeta.id, id, token);
      prev.onChainCalls.push(...newStakingCalls.offChainCalls);
      prev.offChainCalls.push(...newStakingCalls.offChainCalls);
      return prev;
    },
    {
      caller: "NewStaking",
      onChainCalls: [
        {
          target: newStakingMeta.rewardsSchedule,
          function: 'getRewardsForBlockRange',
          interfaceKind: 'RewardsSchedule',
          args: [fromBlock.toString(), Math.floor(fromBlock + BLOCKS_PER_DAY).toString()]
        }
      ],
      offChainCalls: [],
    } as RegisteredCaller
  );

  dispatch(
    actions.callsRegistered([
      pairDataCalls,
      poolDetailCalls,
      totalSuppliesCalls,
      stakingCalls,
      newStakingCalls,
      tokenPriceCalls
    ])
  );
  dispatch(
    requests.fetchStakingData({
      provider,
    })
  )
  dispatch(
    requests.fetchNewStakingData({
      provider
    })
  )
}
