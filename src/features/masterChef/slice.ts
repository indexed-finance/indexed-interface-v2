import { MasterChefMeta, MasterChefPool, MasterChefUpdate } from "./types"; // Circular dependency.
import { convert, createMulticallDataParser } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchMasterChefData } from "./requests";
import { fetchMulticallData } from "../batcher/requests";
import { mirroredServerState, restartedDueToError } from "../actions";
import type { AppState } from "../store";
import type { CallWithResult } from "helpers";

export const masterChefCaller = "MasterChef";

const BLOCKS_PER_DAY = 86400 / 13.5;

export const totalSushiPerDay = convert
  .toToken("100", 18)
  .times(BLOCKS_PER_DAY);

const adapter = createEntityAdapter<MasterChefPool>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const initialState = {
  metadata: {
    totalAllocPoint: 0,
    poolCount: 0,
  } as MasterChefMeta,
};

const slice = createSlice({
  name: "masterChef",
  initialState: adapter.getInitialState(initialState),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchMasterChefData.fulfilled, (state, action) => {
        if (action.payload) {
          adapter.addMany(state, action.payload.pools);
          state.metadata = {
            ...state.metadata,
            ...action.payload.meta,
          };
        }
      })
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        const relevantMulticallData = masterChefMulticallDataParser(
          action.payload
        );
        if (relevantMulticallData) {
          const {
            allocPointsByPool,
            totalStakedByToken,
            userDataByPool,
            totalAllocPoint,
          } = relevantMulticallData;
          if (totalAllocPoint) {
            state.metadata.totalAllocPoint = totalAllocPoint;
          }
          Object.entries(totalStakedByToken).forEach(([token, staked]) => {
            const entry = Object.values(state.entities).find(
              (e) => e?.token.toLowerCase() === token.toLowerCase()
            );
            if (entry) {
              entry.totalStaked = staked;
            }
          });
          Object.entries(userDataByPool).forEach(([pid, userData]) => {
            const entry = state.entities[pid];
            if (!entry) return;
            entry.userEarnedRewards = userData.userEarnedRewards;
            entry.userStakedBalance = userData.userStakedBalance;
          });
          Object.entries(allocPointsByPool).forEach(([pid, allocPoint]) => {
            const entry = state.entities[pid];
            if (!entry) return;
            entry.allocPoint = allocPoint;
          });
        }

        return state;
      })
      .addCase(mirroredServerState, (state, action) => {
        if (!action.payload.masterChef) return;
        for (const id of action.payload.masterChef.ids) {
          const pool = action.payload.masterChef.entities[id];
          const entry = state.entities[id.toLowerCase()];
          if (entry) {
            if (pool.allocPoint) {
              entry.allocPoint = pool.allocPoint;
            }
          } else {
            adapter.addOne(state, pool);
          }
        }
      })
      .addCase(restartedDueToError, () =>
        adapter.getInitialState(initialState)
      ),
});

export const { actions: masterChefActions, reducer: masterChefReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.masterChef);

export const masterChefSelectors = {
  selectAllMasterChefPools(state: AppState) {
    return selectors.selectAll(state);
  },
  selectMasterChefMeta(state: AppState) {
    return state.masterChef.metadata;
  },
  selectMasterChefPool(state: AppState, id: string) {
    return selectors.selectById(state, id);
  },
  selectMasterChefPoolByStakingToken(state: AppState, id: string) {
    return masterChefSelectors
      .selectAllMasterChefPools(state)
      .find(({ token }) => token.toLowerCase() === id.toLowerCase());
  },
  selectMasterChefPoolsByStakingTokens(
    state: AppState,
    ids: string[]
  ): Array<MasterChefPool | undefined> {
    const allPools = masterChefSelectors.selectAllMasterChefPools(state);
    return ids.map((id) =>
      allPools.find((p) => p.token.toLowerCase() === id.toLowerCase())
    );
  },
  selectMasterChefUserStakedBalance(state: AppState, id: string) {
    return masterChefSelectors.selectMasterChefPool(state, id)
      ?.userStakedBalance;
  },
  selectMasterChefInfoLookup(state: AppState, ids: string[]) {
    return ids.reduce((prev, next) => {
      const pool = masterChefSelectors.selectMasterChefPoolByStakingToken(
        state,
        next
      );

      if (pool) {
        const { userStakedBalance = "0", userEarnedRewards = "0" } = pool;

        prev[pool.token] = {
          balance: convert.toBalanceNumber(userStakedBalance.toString(), 18, 6),
          rewards: convert.toBalanceNumber(userEarnedRewards.toString(), 18, 6),
        };
      }

      return prev;
    }, {} as Record<string, { balance: number; rewards: number }>);
  },
};

export const masterChefMulticallDataParser = createMulticallDataParser(
  masterChefCaller,
  (calls) => {
    const update: MasterChefUpdate = {
      totalStakedByToken: {},
      userDataByPool: {},
      allocPointsByPool: {},
      totalAllocPoint: 0,
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
          poolInfo() {
            const id = args[0];
            const [, allocPoint] = values;
            update.allocPointsByPool[id] = +allocPoint.toString();
          },
          pendingSushi() {
            const id = args[0];
            if (!update.userDataByPool[id]) {
              update.userDataByPool[id] = {
                userStakedBalance: "",
                userEarnedRewards: "",
              };
            }
            update.userDataByPool[id].userEarnedRewards = result.toString();
          },
          totalAllocPoint() {
            update.totalAllocPoint = +result.toString();
          },
          balanceOf() {
            update.totalStakedByToken[target] = result.toString();
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
