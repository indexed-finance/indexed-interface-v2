import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { abiLookup } from "ethereum/abi";
import { userActions } from "../user";
import type { AppState } from "features/store";
import type { Call } from "ethereum";
import type { InterfaceKind } from "ethereum/abi";

export type RegisteredCall = {
  caller: string;
  interfaceKind: InterfaceKind;
  target: string;
  function: string;
  args?: string[];
};

interface BatcherState {
  blockNumber: number;
  calls: string[];
  listenerCounts: Record<string, number>;
}

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
        const callId = serializeCallId(call);

        state.calls.push(callId);
        state.listenerCounts[callId] = (state.listenerCounts[callId] ?? 0) + 1;
      }
    },
    registrantUnregistered(state, action: PayloadAction<RegisteredCall[]>) {
      const calls = action.payload;

      for (const call of calls) {
        const callId = serializeCallId(call);

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
  selectBatch: (state: AppState) =>
    state.batcher.calls.reduce(
      (prev, next) => {
        const [from] = next.split(": ");

        if (!prev.registrars.includes(from)) {
          prev.registrars.push(from);
          prev.callsByRegistrant[from] = [];
        }

        if (!prev.callsByRegistrant[from].includes(next)) {
          const deserialized = deserializeCallId(next);

          if (deserialized) {
            prev.callsByRegistrant[from].push(next);
            prev.deserializedCalls.push(deserialized);
          }
        }

        prev.callsByRegistrant[from].push();

        return prev;
      },
      {
        registrars: [],
        callsByRegistrant: {},
        deserializedCalls: [],
      } as {
        registrars: string[];
        callsByRegistrant: Record<string, string[]>;
        deserializedCalls: Call[];
      }
    ),

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
export function serializeCallId(call: RegisteredCall): string {
  return `(${call.caller}): ${call.interfaceKind}/${call.target}/${
    call.function
  }/${(call.args ?? []).join("_")}`;
}

export function deserializeCallId(callId: string): null | Call {
  try {
    const [, callData] = callId.split(": ");
    const [interfaceKind, target, fn, args] = callData.split("/");
    const abi = abiLookup[interfaceKind as InterfaceKind];
    const common = {
      target,
      interface: abi,
      function: fn,
    };

    if (args) {
      return {
        ...common,
        args: args.split("_"),
      };
    } else {
      return common;
    }
  } catch (error) {
    console.error("Bad call ID", callId, error);
    return null;
  }
}
// #endregion
