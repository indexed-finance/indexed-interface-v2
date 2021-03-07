import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { PoolUnderlyingToken } from "indexed-types";
import type { AppState } from "features/store";

type ListenerKind = "PoolData" | "TokenUserData";

interface ListenerConfig {
  id: string;
  pool: string;
  kind: ListenerKind;
  args: any[];
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
});

export const { actions } = slice;

export const selectors = {
  selectBlockNumber: (state: AppState) => state.batcher.blockNumber,
  selectBatch: (state: AppState) => {
    const filled = state.batcher.batch.map((id) => state.batcher.listeners[id]);
    const taskCache: Record<string, true> = {};
    const separatedTasks = [...filled, ...filled].reduce(
      (prev, next) => {
        const task = next;
        const uniqueArgs = task.args.filter(
          (taskArg) =>
            !taskCache[createTaskId(next.kind, next.pool, taskArg.token.id)]
        ) as PoolUnderlyingToken[];

        if (uniqueArgs.length > 0) {
          const listenerKindToProperty: Record<
            ListenerKind,
            ListenerConfig[]
          > = {
            PoolData: prev.poolDataTasks,
            TokenUserData: prev.tokenUserDataTasks,
          };
          const propertyToPushTo = listenerKindToProperty[next.kind];

          for (const taskArg of uniqueArgs) {
            taskCache[
              createTaskId(next.kind, next.pool, taskArg.token.id)
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
        poolDataTasks: [],
        tokenUserDataTasks: [],
      } as Record<string, ListenerConfig[]>
    );

    return separatedTasks;
  },
};

export default slice.reducer;

// #region Helpers
function createTaskId(kind: ListenerKind, poolId: string, tokenId: string) {
  return `${kind}-${poolId}-${tokenId}`;
}
// #endregion
