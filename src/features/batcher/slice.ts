import {
  MulticallData,
  cachedMulticallDataReceived,
  multicallDataReceived,
  multicallDataRequested,
  restartedDueToError,
} from "features/actions";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  RegisteredCall,
  createOffChainBatch,
  createOnChainBatch,
  serializeOffChainCall,
  serializeOnChainCall,
} from "helpers";
import { settingsActions } from "../settings";
import { userActions } from "../user";
import type { AppState } from "features/store";

interface BatcherState {
  onChainCalls: string[];
  offChainCalls: string[];
  callers: Record<
    string,
    {
      onChainCalls: string[];
      offChainCalls: string[];
    }
  >;
  listenerCounts: Record<string, number>;
  status: "idle" | "loading" | "deferring to server";
}

const batcherInitialState: BatcherState = {
  onChainCalls: [],
  offChainCalls: [],
  callers: {},
  listenerCounts: {},
  status: "idle",
} as BatcherState;

const slice = createSlice({
  name: "batcher",
  initialState: batcherInitialState,
  reducers: {
    registrantRegistered(
      state,
      action: PayloadAction<{
        caller: string;
        onChainCalls: RegisteredCall[];
        offChainCalls: RegisteredCall[];
      }>
    ) {
      const { caller, onChainCalls, offChainCalls } = action.payload;
      const callerEntry = {
        onChainCalls: [] as string[],
        offChainCalls: [] as string[],
      };

      for (const call of onChainCalls) {
        const callId = serializeOnChainCall(call);

        if (!state.onChainCalls.includes(callId)) {
          state.onChainCalls.push(callId);
        }

        callerEntry.onChainCalls.push(callId);

        state.listenerCounts[callId] = (state.listenerCounts[callId] ?? 0) + 1;
      }

      for (const call of offChainCalls) {
        const callId = serializeOffChainCall(call);

        if (!state.offChainCalls.includes(callId)) {
          state.offChainCalls.push(callId);
        }

        callerEntry.offChainCalls.push(callId);

        state.listenerCounts[callId] = (state.listenerCounts[callId] ?? 0) + 1;
      }

      state.callers[caller] = callerEntry;
    },
    registrantUnregistered(
      state,
      action: PayloadAction<{
        caller: string;
        onChainCalls: RegisteredCall[];
        offChainCalls: RegisteredCall[];
      }>
    ) {
      const { onChainCalls, offChainCalls } = action.payload;

      for (const call of onChainCalls) {
        const callId = serializeOnChainCall(call);

        state.listenerCounts[callId]--;
      }

      for (const call of offChainCalls) {
        const callId = serializeOffChainCall(call);

        state.listenerCounts[callId]--;
      }
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(multicallDataRequested, (state) => {
        state.status = "loading";
      })
      .addCase(settingsActions.connectionEstablished, (state) => {
        state.status = "deferring to server";
      })
      .addCase(restartedDueToError, () => batcherInitialState)
      .addMatcher(
        (action) =>
          [
            settingsActions.connectionLost.type,
            settingsActions.connectionToggled.type,
          ].includes(action.type),
        (state, action) => {
          if (
            action.type === settingsActions.connectionLost.type ||
            (action.type === settingsActions.connectionToggled.type &&
              state.status === "deferring to server")
          ) {
            state.status = "idle";
          }
        }
      )
      .addMatcher(
        (action) =>
          [
            userActions.userDisconnected.type,
            settingsActions.connectionEstablished.type,
          ].includes(action.type),
        (state) => {
          state.onChainCalls = [];
          state.offChainCalls = [];
          state.listenerCounts = {};
        }
      )
      .addMatcher(
        (action) =>
          [
            multicallDataReceived.type,
            cachedMulticallDataReceived.type,
          ].includes(action.type),
        (state, action: PayloadAction<MulticallData>) => {
          const { listenerCounts } = state;

          if (action.type === multicallDataReceived.type) {
            state.status = "idle";
          }

          const oldCalls: Record<string, true> = {};
          for (const [call, value] of Object.entries(listenerCounts)) {
            if (value === 0) {
              oldCalls[call] = true;
              delete listenerCounts[call];
            }
          }

          state.onChainCalls = state.onChainCalls.filter(
            (call) => !oldCalls[call]
          );
          state.offChainCalls = state.offChainCalls.filter(
            (call) => !oldCalls[call]
          );

          return state;
        }
      ),
});

export const { actions: batcherActions, reducer: batcherReducer } = slice;

export const batcherSelectors = {
  selectOnChainBatch(state: AppState) {
    return {
      callers: state.batcher.callers,
      batch: createOnChainBatch(state.batcher.onChainCalls),
    };
  },
  selectOffChainBatch(state: AppState) {
    return createOffChainBatch(state.batcher.offChainCalls);
  },
  selectBatcherStatus(state: AppState) {
    const { status, onChainCalls, offChainCalls } = state.batcher;

    return {
      status,
      onChainCalls: onChainCalls.length,
      offChainCalls: offChainCalls.length,
    };
  },
};
