import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { userActions, userSelectors } from "../user";
import type { AppState } from "features/store";

import { Call, MultiCallTaskConfig, TaskHandlersByKind } from "ethereum/multicall";

// type ListenerKind = "PoolData" | "TokenUserData" | "PairReservesData";

// /**
//  * The `args` prop is given to the batch updater which then constructs the relevant contract calls.
//  * `args` can be anything, but each entry should be specific to a particular call to execute, i.e.
//  * if creating a batch of calls where each call then requires multiple params, each `args` entry
//  * should be a tuple.
//  *
//  * @param id - Unique listener ID, set with middleware
//  * @param kind - Type of batch to execute
//  * @param args - Arguments given to the batch executor
//  * @param otherArgs - Any other relevant data given to the batch executor
//  */
// interface ListenerConfig {
//   id: string;
//   kind: ListenerKind;
//   args: any[];
//   otherArgs?: any;
// }

interface BatcherState {
  blockNumber: number;
  batch: string[];
  listeners: Record<string, MultiCallTaskConfig>;
}

const slice = createSlice({
  name: "batcher",
  initialState: {
    blockNumber: 0,
    batch: [],
    listeners: {},
  } as BatcherState,
  reducers: {
    blockNumberChanged: (state, action: PayloadAction<number>) => {
      state.blockNumber = action.payload;
    },
    listenerRegistered: (state, action: PayloadAction<MultiCallTaskConfig>) => {
      const { id } = action.payload;

      state.listeners[id] = action.payload;
      state.batch.push(id);

      return state;
    },
    listenerUnregistered(state, action: PayloadAction<string>) {
      const id = action.payload;
      delete state.listeners[id];

      state.batch = state.batch.filter((listenerId) => listenerId !== id);
    },
  },
  extraReducers: (builder) =>
    builder.addCase(userActions.userDisconnected.type, (state) => {
      state.batch = [];
      state.listeners = {};
    }),
});

export const { actions } = slice;

export const selectors = {
  selectBlockNumber: (state: AppState) => state.batcher.blockNumber,
  selectTasks: (state: AppState) => state.batcher.batch.map((id) => state.batcher.listeners[id]),
  selectBatch: (state: AppState) => {
    const tasks = selectors.selectTasks(state);
    const account = userSelectors.selectUserAddress(state);
    const context = { state, account };
  
    return tasks.reduce(
      (prev, next) => {
        const taskCalls = TaskHandlersByKind[next.kind].constructCalls(
          context, next.args
        );
        const callCounts = { index: prev.calls.length, count: taskCalls.length };
        prev.calls.push(...taskCalls);
        prev.counts.push(callCounts);
          
        return prev;
      },
      {
        calls: [] as Call[],
        counts: [] as { index: number; count: number; }[],
        tasks
      }
    );
  }
};

export default slice.reducer;

// #region Helpers
function createTaskId(...args: string[]) {
  return args.join("-");
}
// #endregion
