import { PayloadAction, createSlice } from "@reduxjs/toolkit";
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
};

export default slice.reducer;
