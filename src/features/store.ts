import { AnyAction } from "redux";
import { LOCALSTORAGE_KEY } from "config";
import { ThunkAction } from "redux-thunk";
import { configureStore } from "@reduxjs/toolkit";
import { disconnectFromProvider } from "./thunks";
import { userActions } from "./user";
import cloneDeep from "lodash.clonedeep";
import flags from "feature-flags";
import reducer from "./reducer";

export const actionHistory: any = [];

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    })
      // When the user disconnects, remove the global provider and signer.
      .concat(function userDisconnectionMiddleware() {
        return (next) => (action) => {
          if (action.type === userActions.userDisconnected.type) {
            disconnectFromProvider();
          }

          return next(action);
        };
      })
      .concat(function trackActionMiddleware() {
        return (next) => (action) => {
          actionHistory.push(action.type);

          return next(action);
        };
      }),
  preloadedState: flags.saveStateAcrossSessions
    ? loadPersistedState()
    : undefined,
});

store.subscribe(() => {
  try {
    const { batcher, ...rest } = store.getState();
    const cache = cloneDeep(batcher.cache);
    const toSave = JSON.stringify({ cache, ...rest }, null, 2);

    window.localStorage.setItem(LOCALSTORAGE_KEY, toSave);
  } catch (error) {
    console.error("huh?", error);
    // Persistence not available.
  }
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<
  void,
  AppState,
  string | undefined,
  AnyAction
>;

export interface TokenField {
  amount: string;
  token: string;
}

// #region Helpers
export function loadPersistedState() {
  if (typeof window === "undefined") {
    // We're on the server.
    const { loadState } = require("../sockets/server/persistence");
    const state = loadState();

    return state;
  } else {
    // We're on the browser.
    const persistedState = window.localStorage.getItem(LOCALSTORAGE_KEY);

    if (persistedState) {
      const { cache, ...statePartial } = JSON.parse(persistedState);

      statePartial.batcher = {
        blockNumber: 0,
        onChainCalls: [],
        offChainCalls: [],
        callers: {},
        cache,
        listenerCounts: {},
        status: "idle",
      };

      return statePartial;
    }
  }
}
// #endregion
