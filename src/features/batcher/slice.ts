import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { userActions } from "../user";
import type { AppState } from "features/store";

// When a registrant un-registers,
// - for each of the registrants calls, check to see which exist in other registrants.
// - if a call doesn't exist for another registrant, schedule the call to be purged based on its priority?
export type RegisteredCall = {
  target: string;
  function: string;
  args?: string[];
};

interface BatcherState {
  blockNumber: number;
  calls: string[];
  listenerCounts: Record<string, number>;
}

// Call ID format: TARGET/FUNCTION(/ARGS)

const slice = createSlice({
  name: "batcher",
  initialState: {
    blockNumber: 0,
    calls: [],
    listenerCounts: {},
  } as BatcherState,
  reducers: {
    blockNumberChanged: (state, action: PayloadAction<number>) => {
      state.blockNumber = action.payload;
    },
    registrantRegistered(state, action: PayloadAction<RegisteredCall[]>) {
      const calls = action.payload;

      for (const call of calls) {
        const callId = formatCallId(call);

        state.calls.push(callId);
        state.listenerCounts[callId] = (state.listenerCounts[callId] ?? 0) + 1;
      }
    },
    registrantUnregistered(state, action: PayloadAction<RegisteredCall[]>) {
      const calls = action.payload;

      for (const call of calls) {
        const callId = formatCallId(call);

        state.listenerCounts[callId]--;
      }
    },
  },
  extraReducers: (builder) =>
    builder.addCase(userActions.userDisconnected.type, (state) => {
      state.calls = [];
      state.listenerCounts = {};
    }),
});

export const { actions } = slice;

export const selectors = {
  selectBlockNumber: (state: AppState) => state.batcher.blockNumber,
  // selectBatch: (state: AppState) => {
  //   const tasks = selectors.selectTasks(state);
  //   const account = userSelectors.selectUserAddress(state);
  //   const context = { state, account };
  //   const uniqueTasks = Object.entries(
  //     tasks.reduce(
  //       (prev, next) => ({
  //         ...prev,
  //         [next.kind]: [...(prev[next.kind] ?? []), next],
  //       }),
  //       {} as Record<string, MultiCallTaskConfig[]>
  //     ) as Record<string, MultiCallTaskConfig[]>
  //   ).reduce((prev, [kind, tasksOfKind]) => {
  //     const uniqueTasksOfKind = taskHandlersByKind[kind].onlyUniqueTasks(
  //       tasksOfKind
  //     );
  //     return [...prev, ...uniqueTasksOfKind];
  //   }, [] as MultiCallTaskConfig[]);
  //   const batch = uniqueTasks.reduce(
  //     (prev, next) => {
  //       const taskCalls = taskHandlersByKind[next.kind].constructCalls(
  //         context,
  //         next.args
  //       );
  //       const callCounts = {
  //         index: prev.calls.length,
  //         count: taskCalls.length,
  //       };

  //       prev.calls.push(...taskCalls);
  //       prev.counts.push(callCounts);

  //       return prev;
  //     },
  //     {
  //       calls: [] as Call[],
  //       counts: [] as { index: number; count: number }[],
  //       tasks: uniqueTasks,
  //     }
  //   );

  //   return batch;
  // },
};

export default slice.reducer;

// #region Helpers
function formatCallId(call: RegisteredCall): string {
  const callId = `${call.target}/${call.function}`;

  return call.args ? `${callId}/${call.args.join("_")}` : callId;
}
// #endregion
