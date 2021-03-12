import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { userActions } from "../user";
import type { AppState } from "features/store";

type ListenerKind = "PoolData" | "TokenUserData" | "PairReservesData";

/**
 * The `args` prop is given to the batch updater which then constructs the relevant contract calls.
 * `args` can be anything, but each entry should be specific to a particular call to execute, i.e.
 * if creating a batch of calls where each call then requires multiple params, each `args` entry
 * should be a tuple.
 *
 * @param id - Unique listener ID, set with middleware
 * @param kind - Type of batch to execute
 * @param args - Arguments given to the batch executor
 * @param otherArgs - Any other relevant data given to the batch executor
 */
interface ListenerConfig {
  id: string;
  kind: ListenerKind;
  args: any[];
  otherArgs?: any;
}

interface BatcherState {
  blockNumber: number;
  batch: string[];
  listeners: Record<string, ListenerConfig>;
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
    listenerRegistered: (state, action: PayloadAction<ListenerConfig>) => {
      const { id } = action.payload;

      state.listeners[id] = action.payload as ListenerConfig;
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
  selectBatch: (state: AppState) => {
    const filled = state.batcher.batch.map((id) => state.batcher.listeners[id]);
    const taskCache: Record<string, true> = {};
    const separatedTasks = filled.reduce(
      (prev, next) => {
        const task = next;
        // Filter out any duplicate args entries
        const uniqueArgs = task.args.filter(
          (taskArg) =>
            !taskCache[createTaskId(next.kind, JSON.stringify(next.otherArgs || ""), JSON.stringify(taskArg))]
        );

        if (uniqueArgs.length > 0) {
          const listenerKindToProperty: Record<
            ListenerKind,
            ListenerConfig[]
          > = {
            PairReservesData: prev.pairReservesTasks,
            PoolData: prev.poolDataTasks,
            TokenUserData: prev.tokenUserDataTasks,
          };
          const propertyToPushTo = listenerKindToProperty[next.kind];

          for (const taskArg of uniqueArgs) {
            taskCache[
              createTaskId(next.kind, JSON.stringify(next.otherArgs || ""), JSON.stringify(taskArg))
            ] = true;
          }

          propertyToPushTo.push({
            ...task,
            args: uniqueArgs,
          });
        }

        return prev;
      },
      {
        pairReservesTasks: [],
        poolDataTasks: [],
        tokenUserDataTasks: [],
      } as Record<string, ListenerConfig[]>
    );

    return separatedTasks;
  },
};

export default slice.reducer;

// #region Helpers
function createTaskId(...args: string[]) {
  return args.join("-");
}
// #endregion
