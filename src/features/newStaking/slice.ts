import { AllStakingInfoData } from '@indexed-finance/subgraph-clients/dist/staking/types';
import { NewStakingMeta, NewStakingPool, NewStakingPoolUpdate } from "./types"
import { convert, createMulticallDataParser } from "helpers"; // Circular dependency.
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

const slice = createSlice({
  name: "newStaking",
  initialState: adapter.getInitialState({
    metadata: {
      id: '',
      owner: '',
      rewardsSchedule: '',
      startBlock: 12454000,
      endBlock: 17232181,
      rewardsToken: '0x86772b1409b61c639eaac9ba0acfbb6e238e5f83',
      totalAllocPoint: 0,
      poolCount: 0
    } as NewStakingMeta
  }),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchNewStakingData.fulfilled, (state, action) => {
        adapter.addMany(state, action.payload.pools);
        state.metadata = {
          ...state.metadata,
          ...action.payload.meta
        };
      })
      // .addCase(fetchMulticallData.fulfilled, (state, action) => {
      //   const relevantMulticallData = newStakingMulticallDataParser(
      //     action.payload
      //   );

      //   if (relevantMulticallData) {
      //     for (const [stakingPoolAddress, update] of Object.entries(
      //       relevantMulticallData
      //     )) {
      //       const entry = state.entities[stakingPoolAddress];

      //       if (entry) {
      //         if (update.rewardsDuration) entry.rewardsDuration = update.rewardsDuration;
      //         if (update.periodFinish) entry.periodFinish = update.periodFinish;
      //         if (update.rewardRate) entry.rewardRate = update.rewardRate;
      //         if (update.rewardPerTokenStored) entry.rewardPerTokenStored = update.rewardPerTokenStored;
      //         if (update.totalSupply) entry.totalSupply = update.totalSupply;

      //         if (update.userData) {
      //           entry.userData = update.userData;
      //         }
      //       }
      //     }
      //   }

      //   return state;
      // })
      .addCase(mirroredServerState, (_, action) => action.payload.newStaking)
      .addCase(restartedDueToError, () => adapter.getInitialState({
        metadata: {
          id: '',
          owner: '',
          rewardsSchedule: '',
          startBlock: 12454000,
          endBlock: 17232181,
          rewardsToken: '0x86772b1409b61c639eaac9ba0acfbb6e238e5f83',
          totalAllocPoint: 0,
          poolCount: 0
        } as NewStakingMeta
      })),
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
      .find(
        ({ token }) => token.toLowerCase() === id.toLowerCase()
      );
  },
};

const BLOCKS_PER_DAY = 86400 / 13.5;

export const newStakingMulticallDataParser = createMulticallDataParser(
  newStakingCaller,
  (calls) => {
    const formattingStakingData = calls.reduce((prev, next) => {
      const [, functions] = next;
      const formattedStakingPoolUpdate = Object.entries(functions).reduce(
        (prev, next) => {
          const stakingPoolEntry = prev;
          const [fn, results] = next;
          const [{ args, values }] = results.map((item: CallWithResult) => ({
            args: item.args ?? [],
            values: (item.result ?? []).map(convert.toBigNumber),
          }));
          const [result] = values;

          if (result) {
            const handlers: Record<string, () => void> = {
              userInfo() {
                stakingPoolEntry.userStakedBalance = result.toString();
                stakingPoolEntry.id = args[0];

              },
              pendingRewards() {
                stakingPoolEntry.userEarnedRewards = result.toString();
              },
              balanceOf() {
                stakingPoolEntry.totalStaked = result.toString();
              },
            };
            const handler = handlers[fn];

            handler();
          }

          return stakingPoolEntry;
        },
        {
          totalStaked: "",
          userEarnedRewards: "",
          userStakedBalance: ""
        } as NewStakingPoolUpdate
      );

      prev[formattedStakingPoolUpdate.id] = formattedStakingPoolUpdate;

      return prev;
    }, {} as Record<string, NewStakingPoolUpdate>);

    return formattingStakingData;
  }
);