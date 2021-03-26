import {
  PayloadAction,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { convert, createMulticallDataParser } from "helpers";
import { multicallDataReceived } from "features/actions";
import { stakingCaller } from "./hooks";
import type { AppState } from "features/store";
import type { CallWithResult } from "features/batcher/slice";
import type { NormalizedStakingPool, StakingPoolUpdate } from "ethereum/types";

const adapter = createEntityAdapter<NormalizedStakingPool>();

const slice = createSlice({
  name: "staking",
  initialState: adapter.getInitialState(),
  reducers: {
    stakingDataLoaded(state, action: PayloadAction<NormalizedStakingPool[]>) {
      adapter.addMany(state, action.payload);
    },
  },
  extraReducers: (builder) =>
    builder.addCase(multicallDataReceived, (state, action) => {
      const relevantMulticallData = stakingMulticallDataParser(action.payload);

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
          }
        }
      }

      return state;
    }),
});

export const { actions } = slice;

export const selectors = {
  ...adapter.getSelectors((state: AppState) => state.staking),
  selectAllStakingPools(state: AppState) {
    return selectors.selectAll(state);
  },
};

export default slice.reducer;

// #region Helpers
const stakingMulticallDataParser = createMulticallDataParser(
  stakingCaller,
  (calls) => {
    const formattingStakingData = calls.reduce((prev, next) => {
      const [stakingPoolAddress, functions] = next;
      const formattedStakingPoolUpdate = Object.entries(functions).reduce(
        (prev, next) => {
          const stakingPoolEntry = prev;
          const [fn, results] = next;
          const [{ values }] = results.map((item: CallWithResult) => ({
            args: item.args ?? [],
            values: (item.result ?? []).map(convert.toBigNumber),
          }));
          const [result] = values;

          if (result) {
            const handlers: Record<string, () => void> = {
              rewardsDuration: () => {
                stakingPoolEntry.rewardsDuration = result.toNumber();
              },
              periodFinish: () => {
                stakingPoolEntry.periodFinish = result.toNumber();
              },
              rewardRate: () => {
                stakingPoolEntry.rewardRate = result.toString();
              },
              rewardPerToken: () => {
                stakingPoolEntry.rewardPerTokenStored = result.toString();
              },
              totalSupply: () => {
                stakingPoolEntry.totalSupply = result.toString();
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
