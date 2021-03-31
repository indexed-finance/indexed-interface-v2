import {
  PayloadAction,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { convert, createMulticallDataParser } from "helpers";
import {
  mirroredServerState,
  multicallDataReceived,
  restartedDueToError,
} from "features/actions";
import type { AppState } from "features/store";
import type { CallWithResult } from "helpers";
import type { NormalizedStakingPool, StakingPoolUpdate } from "ethereum/types";

export const stakingCaller = "Staking";

const adapter = createEntityAdapter<NormalizedStakingPool>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const initialState = adapter.getInitialState();

const slice = createSlice({
  name: "staking",
  initialState,
  reducers: {
    stakingDataLoaded(state, action: PayloadAction<NormalizedStakingPool[]>) {
      adapter.addMany(state, action.payload);
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(multicallDataReceived, (state, action) => {
        const relevantMulticallData = stakingMulticallDataParser(
          action.payload
        );

        if (relevantMulticallData) {
          for (const [stakingPoolAddress, update] of Object.entries(
            relevantMulticallData
          )) {
            const entry = state.entities[stakingPoolAddress];

            if (entry) {
              entry.rewardsDuration = update.rewardsDuration;
              entry.periodFinish = update.periodFinish;
              entry.rewardRate = update.rewardRate;
              entry.rewardPerTokenStored = update.rewardPerTokenStored;
              entry.totalSupply = update.totalSupply;

              if (update.userData) {
                entry.userData = update.userData;
              }
            }
          }
        }

        return state;
      })
      .addCase(mirroredServerState, (_, action) => {
        const { staking } = action.payload;

        return staking;
      })
      .addCase(restartedDueToError, () => initialState),
});

export const { actions: stakingActions, reducer: stakingReducer } = slice;

export const stakingSelectors = {
  ...adapter.getSelectors((state: AppState) => state.staking),
  selectAllStakingPoolIds(state: AppState) {
    return stakingSelectors.selectAll(state).map((entry) => entry.indexPool);
  },
  selectAllStakingPools(state: AppState) {
    return stakingSelectors.selectAll(state);
  },
  selectStakingPool(state: AppState, id: string) {
    return stakingSelectors.selectById(state, id);
  },
  selectStakingPoolByStakingToken(state: AppState, id: string) {
    return stakingSelectors
      .selectAllStakingPools(state)
      .find((p) => p.stakingToken.toLowerCase() === id.toLowerCase());
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
