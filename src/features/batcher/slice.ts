import {
  Call,
  MultiCallTaskConfig,
  taskHandlersByKind,
} from "ethereum/multicall";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { dedupe } from "helpers";
import { userActions, userSelectors } from "../user";
import type { AppState } from "features/store";

// When a registrant un-registers,
// - for each of the registrants calls, check to see which exist in other registrants.
// - if a call doesn't exist for another registrant, schedule the call to be purged based on its priority?

interface BatcherState {
  blockNumber: number;
  batch: string[];
  listeners: Record<string, MultiCallTaskConfig>;
  //
  calls: string[];
  callsToRegistrants: Record<
    string /* Call ID */,
    string[] /* Registrant IDs */
  >;
  registrantsToCalls: Record<
    string /* Registrant ID */,
    string[] /* Call IDs */
  >;
  callsToPurge: string[];
}

// Call ID format: SPENDER/FUNCTION(/ARGS)

const slice = createSlice({
  name: "batcher",
  initialState: {
    blockNumber: 0,
    batch: [],
    listeners: {},
    //
    calls: [],
    callsToRegistrants: {},
    registrantsToCalls: {},
    callsToPurge: [],
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
    //
    registrantRegistered(
      state,
      action: PayloadAction<{
        registrant: string;
        calls: Array<{
          spender: string;
          function: string;
          args?: string[];
        }>;
      }>
    ) {
      const { registrant, calls } = action.payload;

      for (const call of calls) {
        const callId = `${call.spender}/${call.function}`;
        const fullCallId = call.args
          ? `${callId}/${call.args.join("_")}`
          : callId;

        state.calls.push(fullCallId);

        if (!state.registrantsToCalls[registrant]) {
          state.registrantsToCalls[registrant] = [];
        }

        state.registrantsToCalls[registrant].push(fullCallId);

        if (!state.callsToRegistrants[fullCallId]) {
          state.callsToRegistrants[fullCallId] = [];
        }

        state.callsToRegistrants[fullCallId].push(registrant);
        state.callsToPurge = state.callsToPurge.filter(
          (call) => call !== fullCallId
        );
      }
    },
    registrantUnregistered(state, action: PayloadAction<string>) {
      const registrant = action.payload;
      const calls = state.registrantsToCalls[registrant];

      for (const call of calls) {
        state.callsToRegistrants[call] = state.callsToRegistrants[call].filter(
          (registrantId) => registrant !== registrantId
        );

        if (state.callsToRegistrants[call].length === 0) {
          // When no other registrants need the call, prepare it for purging.
          state.callsToPurge.push(call);
        }
      }

      delete state.registrantsToCalls[registrant];
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
  selectUniqueCalls: (state: AppState, otherCalls: string[]) =>
    dedupe(state.batcher.calls.concat(otherCalls)),
  selectBatch: (state: AppState) => {
    const tasks = selectors.selectTasks(state);
    const account = userSelectors.selectUserAddress(state);
    const context = { state, account };
    const uniqueTasks = Object.entries(
      tasks.reduce(
        (prev, next) => ({
          ...prev,
          [next.kind]: [...(prev[next.kind] ?? []), next],
        }),
        {} as Record<string, MultiCallTaskConfig[]>
      ) as Record<string, MultiCallTaskConfig[]>
    ).reduce((prev, [kind, tasksOfKind]) => {
      const uniqueTasksOfKind = taskHandlersByKind[kind].onlyUniqueTasks(
        tasksOfKind
      );
      return [...prev, ...uniqueTasksOfKind];
    }, [] as MultiCallTaskConfig[]);
    const batch = uniqueTasks.reduce(
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
        tasks: uniqueTasks,
      }
    );

    return batch;
  },
};

export default slice.reducer;
