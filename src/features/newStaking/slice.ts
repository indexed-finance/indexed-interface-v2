import { MULTI_TOKEN_STAKING_ADDRESS, REWARDS_SCHEDULE_ADDDRESS } from "config";
import { NewStakingMeta, NewStakingPool, NewStakingUpdate } from "./types"; // Circular dependency.
import { convert, createMulticallDataParser } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchMulticallData } from "../batcher/requests";
import { fetchNewStakingData } from "./requests";
import { mirroredServerState, restartedDueToError } from "../actions";
import type { AppState } from "../store";
import type { CallWithResult } from "helpers";

export const newStakingCaller = "NewStaking";

const adapter = createEntityAdapter<NewStakingPool>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const initialState = {
  metadata: {
    id: MULTI_TOKEN_STAKING_ADDRESS,
    owner: "",
    rewardsSchedule: REWARDS_SCHEDULE_ADDDRESS,
    startBlock: 12454000,
    endBlock: 17232181,
    rewardsToken: "0x86772b1409b61c639eaac9ba0acfbb6e238e5f83",
    totalAllocPoint: 0,
    poolCount: 0,
  } as NewStakingMeta,
};

const slice = createSlice({
  name: "newStaking",
  initialState: adapter.getInitialState(initialState),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchNewStakingData.fulfilled, (state, action) => {
        if (action.payload) {
          adapter.addMany(state, action.payload.pools);
          state.metadata = {
            ...state.metadata,
            ...action.payload.meta,
          };
        }
      })
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        const relevantMulticallData = newStakingMulticallDataParser(
          action.payload
        );
        if (relevantMulticallData) {
          // console.log(`Got New Staking MultiCall Data`);
          // console.log(relevantMulticallData)
          const { totalRewardsPerDay, totalStakedByToken, userDataByPool } =
            relevantMulticallData;
          Object.entries(totalStakedByToken).forEach(([token, staked]) => {
            const entry = Object.values(state.entities).find(
              (e) => e?.token.toLowerCase() === token.toLowerCase()
            );
            if (entry) entry.totalStaked = staked;
          });
          Object.entries(userDataByPool).forEach(([pid, userData]) => {
            const entry = state.entities[pid];
            if (!entry) return;
            entry.userEarnedRewards = userData.userEarnedRewards;
            entry.userStakedBalance = userData.userStakedBalance;
          });
          if (totalRewardsPerDay) {
            state.metadata.totalRewardsPerDay = totalRewardsPerDay;
            const totalRewards = convert.toBigNumber(totalRewardsPerDay);
            for (const id of state.ids) {
              const entry = state.entities[id];
              if (entry) {
                entry.rewardsPerDay = totalRewards
                  .times(entry.allocPoint)
                  .div(state.metadata.totalAllocPoint)
                  .toString();
              }
            }
          }
        }

        return state;
      })
      .addCase(mirroredServerState, (_, action) => action.payload.newStaking)
      .addCase(restartedDueToError, () =>
        adapter.getInitialState(initialState)
      ),
});

export const { actions: newStakingActions, reducer: newStakingReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.newStaking);

export const newStakingSelectors = {
  selectAllNewStakingPools(state: AppState) {
    return selectors.selectAll(state);
  },
  selectNewStakingMeta(state: AppState) {
    return state.newStaking.metadata;
  },
  selectNewStakingPool(state: AppState, id: string) {
    return selectors.selectById(state, id);
  },
  selectNewStakingPoolByStakingToken(state: AppState, id: string) {
    return newStakingSelectors
      .selectAllNewStakingPools(state)
      .find(({ token }) => token.toLowerCase() === id.toLowerCase());
  },
  selectNewUserStakedBalance(state: AppState, id: string) {
    return newStakingSelectors.selectNewStakingPool(state, id)
      ?.userStakedBalance;
  },
  selectNewStakingPoolsByStakingTokens(
    state: AppState,
    ids: string[]
  ): Array<NewStakingPool | undefined> {
    const allPools = newStakingSelectors.selectAllNewStakingPools(state);

    return ids.map((id) =>
      allPools.find(
        (p) =>
          p.token.toLowerCase() === id.toLowerCase() ||
          // Sometimes the address of the index pool is used instead of the staking pool.
          p.token0?.toLowerCase() === id.toLowerCase() ||
          p.token1?.toLowerCase() === id.toLowerCase()
      )
    );
  },
  selectNewStakingInfoLookup(state: AppState, ids: string[]) {
    return ids.reduce((prev, next) => {
      const pool = newStakingSelectors.selectNewStakingPoolByStakingToken(
        state,
        next
      );

      if (pool) {
        const { userStakedBalance = "0", userEarnedRewards = "0" } = pool;

        prev[pool.token.toLowerCase()] = {
          balance: convert.toBalanceNumber(
            userStakedBalance.toString(),
            pool.decimals,
            6
          ),
          rewards: convert.toBalanceNumber(
            userEarnedRewards.toString(),
            pool.decimals,
            6
          ),
        };
      }

      return prev;
    }, {} as Record<string, { balance: number; rewards: number }>);
  },
};

export const newStakingMulticallDataParser = createMulticallDataParser(
  newStakingCaller,
  (calls) => {
    const update: NewStakingUpdate = {
      totalStakedByToken: {},
      userDataByPool: {},
      totalRewardsPerDay: "",
    };
    const handleCall = ([fn, results]: [string, CallWithResult[]]) => {
      const formattedResults = results.map((item: CallWithResult) => ({
        target: item.target,
        args: item.args ?? [],
        values: item.result ?? [],
      }));
      for (const { args, values, target } of formattedResults) {
        const [result] = values;
        const handlers: Record<string, () => void> = {
          userInfo() {
            const id = args[0];
            if (!update.userDataByPool[id]) {
              update.userDataByPool[id] = {
                userStakedBalance: "",
                userEarnedRewards: "",
              };
            }
            update.userDataByPool[id].userStakedBalance = result.toString();
          },
          pendingRewards() {
            const id = args[0];
            if (!update.userDataByPool[id]) {
              update.userDataByPool[id] = {
                userStakedBalance: "",
                userEarnedRewards: "",
              };
            }
            update.userDataByPool[id].userEarnedRewards = result.toString();
          },
          balanceOf() {
            update.totalStakedByToken[target] = result.toString();
          },
          getRewardsForBlockRange() {
            update.totalRewardsPerDay = result.toString();
          },
        };
        if (result) {
          handlers[fn]();
        }
      }
    };

    calls.forEach(([, functions]) =>
      Object.entries(functions).forEach(handleCall)
    );

    return update;
  }
);
