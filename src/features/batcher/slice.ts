import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { userActions, userSelectors } from "../user";
import type { AppState } from "features/store";

import {
  Call,
  MultiCallTaskConfig,
  taskHandlersByKind,
} from "ethereum/multicall";

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
  selectTasks: (state: AppState) =>
    state.batcher.batch.map((id) => state.batcher.listeners[id]),
  selectBatch: (state: AppState) => {
    const tasks = selectors.selectTasks(state);
    const account = userSelectors.selectUserAddress(state);
    const context = { state, account };

    return tasks.reduce(
      (prev, next) => {
        const taskCalls = taskHandlersByKind[next.kind].constructCalls(
          context,
          next.args
        );
        const callCounts = {
          index: prev.calls.length,
          count: taskCalls.length,
        };

        prev.calls.push(...taskCalls);
        prev.counts.push(callCounts);

        return prev;
      },
      {
        calls: [] as Call[],
        counts: [] as { index: number; count: number }[],
        tasks,
      }
    );
  },
};

export default slice.reducer;
