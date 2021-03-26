import {
  MulticallData,
  cachedMulticallDataReceived,
  multicallDataReceived,
  multicallDataRequested,
} from "features/actions";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { abiLookup } from "ethereum/abi";
import { settingsActions } from "../settings";
import { userActions } from "../user";
import type { AppState, AppThunk } from "features/store";
import type { InterfaceKind } from "ethereum/abi";

export type RegisteredCall = {
  interfaceKind?: InterfaceKind;
  target: string;
  function: string;
  args?: string[];
};

export type RegisteredCaller = {
  caller: string;
  onChainCalls: RegisteredCall[];
  offChainCalls: RegisteredCall[];
};

export type CallWithResult = Omit<RegisteredCall, "interface" | "args"> & {
  result?: string[];
  args?: string[];
};

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

const slice = createSlice({
  name: "batcher",
  initialState: {
    onChainCalls: [],
    offChainCalls: [],
    callers: {},
    listenerCounts: {},
    status: "idle",
  } as BatcherState,
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

        callerEntry.onChainCalls.push(callId);

        state.onChainCalls.push(callId);
        state.listenerCounts[callId] = (state.listenerCounts[callId] ?? 0) + 1;
      }

      for (const call of offChainCalls) {
        const callId = serializeOffChainCall(call);

        callerEntry.offChainCalls.push(callId);

        state.offChainCalls.push(callId);
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

export const { actions } = slice;

export const selectors = {
  selectOnChainBatch(state: AppState) {
    return {
      callers: state.batcher.callers,
      batch: createOnChainBatch(state.batcher.onChainCalls),
    };
  },
  selectOffChainBatch(state: AppState) {
    return state.batcher.offChainCalls;
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

export default slice.reducer;

// #region Helpers
export function createOnChainBatch(fromCalls: string[]) {
  return fromCalls.reduce(
    (prev, next) => {
      const [from] = next.split(": ");

      if (!prev.registrars.includes(from)) {
        prev.registrars.push(from);
        prev.callsByRegistrant[from] = [];
      }

      if (!prev.callsByRegistrant[from].includes(next)) {
        const deserialized = deserializeOnChainCall(next);

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
      deserializedCalls: RegisteredCall[];
    }
  );
}

export function serializeOnChainCall(call: RegisteredCall): string {
  return `${call.interfaceKind}/${call.target}/${call.function}/${(
    call.args ?? []
  ).join("_")}`;
}

export function deserializeOnChainCall(callId: string): null | RegisteredCall {
  try {
    const [interfaceKind, target, fn, args] = callId.split("/");
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
    console.error("Bad on-chain call ID", callId, error);
    return null;
  }
}

export function serializeOffChainCall(call: RegisteredCall): string {
  return `${call.function}/${(call.args ?? []).join("_")}`;
}

export function deserializeOffChainCall(
  callId: string,
  actions: Record<string, (...params: any[]) => AppThunk>
) {
  try {
    const [fn, args] = callId.split("/");
    const action = actions[fn];

    if (args) {
      const split = args.split("_");

      return action.bind(null, ...split);
    } else {
      return action;
    }
  } catch (error) {
    console.error("Bad off-chain call ID");
    return null;
  }
}
// #endregion
