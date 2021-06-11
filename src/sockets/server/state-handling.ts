import { INFURA_ID, MASTER_CHEF_ADDRESS, NDX_ADDRESS } from "config";
import {
  TOKEN_PRICES_CALLER,
  buildUniswapPairs,
  createPairDataCalls,
  createPoolDetailCalls,
  createStakingCalls,
  createTotalSuppliesCalls,
} from "hooks";
import {createMasterChefCalls} from "hooks/masterchef-hooks"

import { Unsubscribe } from "redux";
import { actions, requests, selectors, store } from "features";
import { createNewStakingCalls } from "hooks/new-staking-hooks";
import { log } from "./helpers";
import { masterChefCaller } from "features/masterChef";
import { providers } from "ethers";
import type { CallRegistration, RegisteredCall, RegisteredCaller } from "helpers";

// The same provider is used for the lifetime of the server.
const { dispatch, getState, subscribe } = store;
const provider = new providers.InfuraProvider("mainnet", INFURA_ID);

const poolsRegistered: Record<string, boolean> = {};
const tokensRegistered: Record<string, boolean> = {};
const pairsRegistered: Record<string, boolean> = {};
const stakingPoolsRegistered: Record<string, boolean> = {};

const NEW_SUBSCRIBER_DELAY_SECONDS = 15;

let subbed = false;
let unsubscribe: Unsubscribe;

function setSubscription() {
  subbed = true;
  unsubscribe = subscribe(() => {
    const state = getState();
    const indexPools = selectors.selectAllPools(state);
    const stakingPools = selectors.selectAllStakingPools(state);
    const tokens = selectors.selectAllTokens(state);

    if (indexPools.length > 0 && tokens.length > 0 && stakingPools.length > 0) {
      unsubscribe();
      const allCalls = [
        ...registerNewPools(),
        ...registerNewTokensAndPairs(),
        ...registerNewStakingPools(),
      ].filter(c => c.offChainCalls.length > 0 || c.onChainCalls.length > 0)
      if (allCalls.length > 0) {
        dispatch(actions.callsRegistered(allCalls))
      }
      subbed = false;
    }
  });
}

setInterval(() => {
  if (!subbed) {
    setSubscription();
  }
}, NEW_SUBSCRIBER_DELAY_SECONDS * 1000)


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

const BLOCKS_PER_DAY = 86400 / 13.5;

function registerNewTokensAndPairs() {
  const state = getState();
  const allTokens = selectors.selectAllTokens(state);
  const allPairIds = Object.keys(state.pairs.entities).map((id) => id.toLowerCase());
  const priceTokenIds = allTokens.map(t => t.id).filter((tokenId) => !tokensRegistered[tokenId.toLowerCase()]);
  const pairTokenIds = allTokens.map(t => t.id).filter((tokenId) => !allPairIds.includes(tokenId.toLowerCase()));

  let pairs = buildUniswapPairs(pairTokenIds).filter(
    (pair) => !pairsRegistered[pair.id.toLowerCase()]
  );
  const mcPairs = selectors.selectPossibleMasterChefPairs(state).filter(p => {
    return !pairs.find(p0 => p0.id.toLowerCase() === p.id.toLowerCase())
  });
  pairs = [ ...pairs, ...mcPairs ];
  dispatch(actions.uniswapPairsRegistered(pairs))
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
        args: priceTokenIds,
        canBeMerged: true,
      },
    ],
  };
  priceTokenIds.forEach((tokenId) => {
    tokensRegistered[tokenId.toLowerCase()] = true;
  });
  pairs.forEach((pair) => {
    pairsRegistered[pair.id.toLowerCase()] = true;
  });

  const totalSuppliesCalls = {
    caller: "Total Supplies",
    onChainCalls: createTotalSuppliesCalls(pairs.map((pair) => pair.id.toLowerCase())),
    offChainCalls: [],
  };

  return [
    pairDataCalls,
    tokenPriceCalls,
    totalSuppliesCalls
  ];
}

function registerNewPools() {
  const state = getState();
  const indexPools = selectors.selectAllPools(state).filter(pool => !poolsRegistered[pool.id.toLowerCase()]);
  const { poolDetailCalls } = indexPools.reduce(
    (prev, next) => {
      const { id } = next;
      poolsRegistered[id.toLowerCase()] = true;
      const tokenIds = selectors.selectPoolTokenIds(state, id);
      const poolDetailCalls = createPoolDetailCalls(id, tokenIds);
      prev.poolDetailCalls.onChainCalls.push(...poolDetailCalls.onChainCalls);
      prev.poolDetailCalls.offChainCalls.push(
        ...(poolDetailCalls.offChainCalls as RegisteredCall[])
      );
      return prev;
    },
  {
      poolDetailCalls: {
        caller: "Pool Data",
        onChainCalls: [],
        offChainCalls: [],
      },
    } as {
      poolDetailCalls: RegisteredCaller;
    }
  );
  return [poolDetailCalls];
}

function registerNewStakingPools() {
  const state = getState();
  const stakingPools = selectors.selectAllStakingPools(state).filter((pool) => !stakingPoolsRegistered[pool.id.toLowerCase()]);
  const newStakingPools = selectors.selectAllNewStakingPools(state).filter((pool) => !stakingPoolsRegistered[pool.id.toLowerCase()]);
  const masterChefPairs = selectors.selectMasterChefPoolsWithRecognizedPairs(state).filter((pool) => !stakingPoolsRegistered[`MC-${pool.id}`.toLowerCase()]);
  const newStakingMeta = selectors.selectNewStakingMeta(state);
  const calls: RegisteredCaller[] = [];
  if (newStakingPools.length > 0) {
    const fromBlock = newStakingPools.sort((a, b) => b.lastRewardBlock - a.lastRewardBlock)[0].lastRewardBlock;
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
    calls.push(newStakingCalls);

    newStakingPools.forEach((pool) => {
      stakingPoolsRegistered[pool.id.toLowerCase()] = true;
    });
  }
  if (stakingPools.length > 0) {
    const stakingCalls = stakingPools.reduce(
      (prev, next) => {
        const { id, stakingToken } = next;
        const stakingCalls = createStakingCalls(id, stakingToken);
  
        prev.onChainCalls.push(...stakingCalls.onChainCalls);
  
        return prev;
      },
      {
        caller: "Staking",
        onChainCalls: [],
        offChainCalls: [],
      } as RegisteredCaller
    );
    stakingPools.forEach((pool) => {
      stakingPoolsRegistered[pool.id.toLowerCase()] = true;
    });
    calls.push(stakingCalls)
  }
  if (masterChefPairs.length > 0) {
    const mcCalls = masterChefPairs.reduce(
      (prev, next) => {
        const poolCalls = createMasterChefCalls(
          next.id,
          next.token,
        );
        prev.onChainCalls.push(...poolCalls);
        return prev;
      },
      {
        caller: masterChefCaller,
        onChainCalls: [
          {
            interfaceKind: "MasterChef",
            target: MASTER_CHEF_ADDRESS,
            function: "totalAllocPoint",
          },
        ],
        offChainCalls: [],
      } as RegisteredCaller
    );
    masterChefPairs.forEach((pool) => {
      stakingPoolsRegistered[`MC-${pool.id}`.toLowerCase()] = true;
    })
    calls.push(mcCalls);

  }
  return calls;
}