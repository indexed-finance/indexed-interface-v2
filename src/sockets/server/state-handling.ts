import { AppState, VAULTS_CALLER, actions, fetchVaultsData, selectors, store } from "features";
import { MASTER_CHEF_ADDRESS, NETWORKS } from "config";
import {
  TOKEN_PRICES_CALLER,
  buildUniswapPairs,
  createPairDataCalls,
  createPoolDetailCalls,
  createStakingCalls,
  createTotalSuppliesCalls,
  createVaultCalls,
} from "hooks";
import { createMasterChefCalls } from "hooks/masterchef-hooks";
import { createNewStakingCalls } from "hooks/new-staking-hooks";
import { getProvider, log, readState, writeState } from "./helpers";
import { masterChefCaller } from "features/masterChef";
import type { RegisteredCall, RegisteredCaller } from "helpers";
import type { Unsubscribe } from "redux";

// The same provider is used for the lifetime of the server.
const { dispatch, getState, subscribe } = store;
const network = process.argv[2];
const chainId = NETWORKS[network].id;
const provider = getProvider(network);

const getLastBlockNumber = () => {
  const lastStateJson = readState(network);
  if (lastStateJson) {
    const lastState = JSON.parse(lastStateJson) as AppState;
    return lastState.batcher.blockNumber;
  }
  return -1;
}

let lastBlockNumber = getLastBlockNumber();

const poolsRegistered: Record<string, boolean> = {};
const tokensRegistered: Record<string, boolean> = {};
const pairsRegistered: Record<string, boolean> = {};
const stakingPoolsRegistered: Record<string, boolean> = {};
const vaultsRegistered: Record<string, string> = {}

const NEW_SUBSCRIBER_DELAY_SECONDS = 15;
const WRITE_STATE_INTERVAL = 5000;

let subbed = false;
let unsubscribe: Unsubscribe;

function setSubscription() {
  subbed = true;
  unsubscribe = subscribe(() => {
    const state = getState();
    const indexPools = selectors.selectAllPools(state);
    const stakingPools = selectors.selectAllStakingPools(state);
    const tokens = selectors.selectAllTokens(state);
    const vaults = selectors.selectAllVaults(state)

    if (indexPools.length > 0 && tokens.length > 0 && stakingPools.length > 0 && vaults.length > 0) {
      unsubscribe();
      const allCalls = [
        ...registerNewPools(),
        ...registerNewTokensAndPairs(),
        ...registerNewStakingPools(),
        ...registerNewVaults()
      ].filter((c) => c.offChainCalls.length > 0 || c.onChainCalls.length > 0);
      if (allCalls.length > 0) {
        dispatch(actions.callsRegistered(allCalls));
      }
      subbed = false;
    }
  });
}

setInterval(() => {
  if (!subbed) {
    setSubscription();
  }
}, NEW_SUBSCRIBER_DELAY_SECONDS * 1000);

setInterval(() => {
  const state = getState();
  const stateInitialized = subbed && state.indexPools.ids.length > 0;
  // Don't write to state if not fully initialized or unchanged
  if (stateInitialized) {
    if (lastBlockNumber !== state.batcher.blockNumber) {
      console.log(`Writing ${network} state to storage...`);
      writeState(network, JSON.stringify(state));
      lastBlockNumber = state.batcher.blockNumber;
    }
  }
}, WRITE_STATE_INTERVAL);

/**
 * After creating the connection, allow it to update before initializing the store.
 */
export async function setupStateHandling() {
  log("Waiting for provider.");

  await provider.ready;

  log("Provider ready. Initializing.");

  dispatch(
    actions.setNetwork({
      provider,
      withSigner: false,
    })
  );
  dispatch(
    fetchVaultsData({
      provider
    })
  )
}

function registerNewVaults() {
  const state = getState();
  const vaults = selectors.selectAllVaults(state);
  const caller = VAULTS_CALLER;
  const { vaultCalls } = vaults.reduce((prev, next) => {
    const { onChainCalls, offChainCalls } = createVaultCalls(next.id, next.adapters.map(a => a.id), next.underlying.id);
    prev.vaultCalls.onChainCalls.push(...onChainCalls)
    prev.vaultCalls.offChainCalls.push(...offChainCalls)
    return prev;
  }, {
    vaultCalls: {
      chainId,
      caller,
      onChainCalls: [] as RegisteredCall[],
      offChainCalls: [] as RegisteredCall[],
    }
  })
  return [vaultCalls]
}

const BLOCKS_PER_DAY = 86400 / 13.5;

function registerNewTokensAndPairs() {
  const state = getState();
  const chainId = selectors.selectNetwork(state)
  const allTokens = selectors.selectAllTokens(state).filter(t => t.chainId === chainId);
  const allPairIds = Object.keys(state.pairs.entities).map((id) =>
    id.toLowerCase()
  );

  const allTokenIds = allTokens
    .map((t) => t.id)
    .filter(
      (tokenId) =>
        !tokensRegistered[tokenId.toLowerCase()] &&
        !allPairIds.includes(tokenId.toLowerCase())
    );

  const pairs = buildUniswapPairs(allTokenIds, chainId).filter(
    (pair) => !pairsRegistered[pair.id.toLowerCase()]
  );

  if (chainId !== undefined) dispatch(actions.uniswapPairsRegistered({ pairs, chainId }));
  const pairDataCalls = {
    caller: "Pair Data",
    chainId,
    onChainCalls: createPairDataCalls(pairs),
    offChainCalls: [],
  };
  const tokenPriceCalls = {
    caller: TOKEN_PRICES_CALLER,
    chainId,
    onChainCalls: [],
    offChainCalls: [
      {
        target: "",
        function: "fetchTokenPriceData",
        args: allTokenIds,
        canBeMerged: true,
      },
    ],
  };
  allTokenIds.forEach((tokenId) => {
    tokensRegistered[tokenId.toLowerCase()] = true;
  });
  pairs.forEach((pair) => {
    pairsRegistered[pair.id.toLowerCase()] = true;
  });

  const totalSuppliesCalls = {
    caller: "Total Supplies",
    chainId,
    onChainCalls: createTotalSuppliesCalls(
      pairs.map((pair) => pair.id.toLowerCase())
    ),
    offChainCalls: [],
  };

  return [pairDataCalls, tokenPriceCalls, totalSuppliesCalls];
}

function registerNewPools() {
  const state = getState();
  const indexPools = selectors
    .selectAllPools(state)
    .filter((pool) => !poolsRegistered[pool.id.toLowerCase()]);
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
        chainId,
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
  const stakingPools = selectors
    .selectAllStakingPools(state)
    .filter((pool) => !stakingPoolsRegistered[pool.id.toLowerCase()]);
  const newStakingPools = selectors
    .selectAllNewStakingPools(state)
    .filter((pool) => !stakingPoolsRegistered[pool.id.toLowerCase()]);
  const masterChefPairs = selectors
    .selectMasterChefPoolsWithRecognizedPairs(state)
    .filter((pool) => !stakingPoolsRegistered[`MC-${pool.id}`.toLowerCase()]);
  const newStakingMeta = selectors.selectNewStakingMeta(state);
  const calls: RegisteredCaller[] = [];
  const chainId = state.settings.network;
  const masterChefAddress = MASTER_CHEF_ADDRESS[chainId]
  if (newStakingPools.length > 0) {
    const fromBlock = newStakingPools.sort(
      (a, b) => b.lastRewardBlock - a.lastRewardBlock
    )[0].lastRewardBlock;
    const newStakingCalls = newStakingPools.reduce(
      (prev, next) => {
        const { id, token } = next;
        const newStakingCalls = createNewStakingCalls(
          newStakingMeta.id,
          id,
          token
        );
        prev.onChainCalls.push(...newStakingCalls.offChainCalls);
        prev.offChainCalls.push(...newStakingCalls.offChainCalls);
        return prev;
      },
      {
        caller: "NewStaking",
        chainId,
        onChainCalls: [
          {
            target: newStakingMeta.rewardsSchedule,
            function: "getRewardsForBlockRange",
            interfaceKind: "RewardsSchedule",
            args: [
              fromBlock.toString(),
              Math.floor(fromBlock + BLOCKS_PER_DAY).toString(),
            ],
          },
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
        chainId,
        onChainCalls: [],
        offChainCalls: [],
      } as RegisteredCaller
    );
    stakingPools.forEach((pool) => {
      stakingPoolsRegistered[pool.id.toLowerCase()] = true;
    });
    calls.push(stakingCalls);
  }
  if (masterChefPairs.length > 0 && masterChefAddress) {
    const mcCalls = masterChefPairs.reduce(
      (prev, next) => {
        const poolCalls = createMasterChefCalls(chainId, next.id, next.token);
        prev.onChainCalls.push(...poolCalls);
        return prev;
      },
      {
        caller: masterChefCaller,
        chainId,
        onChainCalls: [
          {
            interfaceKind: "MasterChef",
            target: masterChefAddress,
            function: "totalAllocPoint",
          },
        ],
        offChainCalls: [],
      } as RegisteredCaller
    );
    masterChefPairs.forEach((pool) => {
      stakingPoolsRegistered[`MC-${pool.id}`.toLowerCase()] = true;
    });
    calls.push(mcCalls);
  }
  return calls;
}

setupStateHandling();

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  console.log(`Killing ${network} state updater...`);
  process.exit(0)
})