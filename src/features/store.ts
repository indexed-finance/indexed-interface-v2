import { AnyAction } from "redux";
import { LOCALSTORAGE_KEY } from "config";
import { ThunkAction } from "redux-thunk";
import { configureStore } from "@reduxjs/toolkit";
import { disconnectFromProvider } from "./thunks";
import { userActions } from "./user";
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
    const state = JSON.stringify(store.getState(), null, 2);

    window.localStorage.setItem(LOCALSTORAGE_KEY, state);
  } catch {
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
  try {
    const persistedState = window.localStorage.getItem(LOCALSTORAGE_KEY);

    if (persistedState) {
      const state = JSON.parse(persistedState);

      delete state.batcher;
      delete state.user;

      return state;
    }
  } catch (error) {
    return undefined;
  }
}
// #endregion
