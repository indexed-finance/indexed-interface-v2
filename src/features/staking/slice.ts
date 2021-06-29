import { convert, createMulticallDataParser } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchMulticallData } from "../batcher/requests"; // Circular dependency.
import { fetchStakingData } from "./requests";
import { mirroredServerState, restartedDueToError } from "../actions";
import type { AppState } from "../store";
import type { CallWithResult } from "helpers";
import type { NormalizedStakingPool, StakingPoolUpdate } from "./types";

export const stakingCaller = "Staking";

const adapter = createEntityAdapter<NormalizedStakingPool>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const slice = createSlice({
  name: "staking",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchStakingData.fulfilled, (state, action) => {
        adapter.addMany(state, action.payload);
      })
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        const relevantMulticallData = stakingMulticallDataParser(
          action.payload
        );

        if (relevantMulticallData) {
          for (const [stakingPoolAddress, update] of Object.entries(
            relevantMulticallData
          )) {
            const entry = state.entities[stakingPoolAddress];

            if (entry) {
              if (update.rewardsDuration)
                entry.rewardsDuration = update.rewardsDuration;
              if (update.periodFinish) entry.periodFinish = update.periodFinish;
              if (update.rewardRate) entry.rewardRate = update.rewardRate;
              if (update.rewardPerTokenStored)
                entry.rewardPerTokenStored = update.rewardPerTokenStored;
              if (update.totalSupply) entry.totalSupply = update.totalSupply;

              if (update.userData) {
                entry.userData = update.userData;
              }
            }
          }
        }

        return state;
      })
      .addCase(mirroredServerState, (_, action) => action.payload.staking)
      .addCase(restartedDueToError, () => adapter.getInitialState()),
});

export const { actions: stakingActions, reducer: stakingReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.staking);

export const stakingSelectors = {
  selectAllStakingPoolIds(state: AppState) {
    return selectors.selectAll(state).map(({ indexPool }) => indexPool);
  },
  selectAllStakingPools(state: AppState) {
    return selectors.selectAll(state);
  },
  selectStakingPool(state: AppState, id: string) {
    return selectors.selectById(state, id);
  },
  selectStakingPoolByStakingToken(state: AppState, id: string) {
    return stakingSelectors
      .selectAllStakingPools(state)
      .find(
        ({ stakingToken }) => stakingToken.toLowerCase() === id.toLowerCase()
      );
  },
  selectStakingPoolsByStakingTokens(
    state: AppState,
    ids: string[]
  ): Array<NormalizedStakingPool | undefined> {
    const allPools = stakingSelectors.selectAllStakingPools(state);

    return ids.map((id) =>
      allPools.find((p) => p.stakingToken.toLowerCase() === id.toLowerCase())
    );
  },
  selectStakingPoolByIndexPool(state: AppState, indexPoolAddress: string) {
    const allPools = stakingSelectors.selectAllStakingPools(state);

    return allPools.find((pool) => pool.indexPool === indexPoolAddress) ?? null;
  },
};

// #region Helpers
export const stakingMulticallDataParser = createMulticallDataParser(
  stakingCaller,
  (calls) => {
    const formattingStakingData = calls.reduce((prev, next) => {
      const [stakingPoolAddress, functions] = next;
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
              rewardsDuration() {
                stakingPoolEntry.rewardsDuration = result.toNumber();
              },
              periodFinish() {
                stakingPoolEntry.periodFinish = result.toNumber();
              },
              rewardRate() {
                stakingPoolEntry.rewardRate = result.toString();
              },
              rewardPerToken() {
                stakingPoolEntry.rewardPerTokenStored = result.toString();
              },
              totalSupply() {
                stakingPoolEntry.totalSupply = result.toString();
              },
              balanceOf() {
                const [userAddress] = args;

                if (!stakingPoolEntry.userData) {
                  stakingPoolEntry.userData = {
                    userAddress,
                    userRewardsEarned: "",
                    userStakedBalance: "",
                  };
                }

                stakingPoolEntry.userData = {
                  ...stakingPoolEntry.userData,
                  userAddress,
                  userStakedBalance: result.toString(),
                };
              },
              earned() {
                const [userAddress] = args;

                if (!stakingPoolEntry.userData) {
                  stakingPoolEntry.userData = {
                    userAddress,
                    userRewardsEarned: "",
                    userStakedBalance: "",
                  };
                }

                stakingPoolEntry.userData = {
                  ...stakingPoolEntry.userData,
                  userAddress,
                  userRewardsEarned: result.toString(),
                };
              },
            };
            const handler = handlers[fn];

            handler();
          }

          return stakingPoolEntry;
        },
        {
          rewardsDuration: 0,
          periodFinish: 0,
          rewardRate: "",
          rewardPerTokenStored: "",
          totalSupply: "",
        } as StakingPoolUpdate
      );

      formattedStakingPoolUpdate.id = stakingPoolAddress;

      prev[stakingPoolAddress] = formattedStakingPoolUpdate;

      return prev;
    }, {} as Record<string, StakingPoolUpdate>);

    return formattingStakingData;
  }
);
// #endregion
