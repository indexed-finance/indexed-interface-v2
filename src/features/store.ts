import { AnyAction } from "redux";
import { FEATURE_FLAGS } from "feature-flags";
import { LOCALSTORAGE_KEY } from "config";
import { ThunkAction } from "redux-thunk";
import { configureStore } from "@reduxjs/toolkit";
import { disconnectFromProvider } from "./thunks";
import { rootReducer } from "./reducer";
import { userActions } from "./user";

export const actionHistory: any = [];

const store = configureStore({
  reducer: rootReducer,
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
  // .concat(function () {
  //   return (next) => (action) => {
  //     debugger;

  //     return next(action);
  //   };
  // }),
  preloadedState: FEATURE_FLAGS.saveStateAcrossSessions
    ? loadPersistedState()
    : undefined,
});

store.subscribe(() => {
  try {
    const { batcher, ...toSave } = store.getState();

    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    // Persistence not available.
  }
});

export { store };

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
  if (window?.localStorage) {
    // We're on the browser.
    const persistedState = window.localStorage.getItem(LOCALSTORAGE_KEY);

    if (persistedState) {
      const state = JSON.parse(persistedState);

      state.cache.blockNumber = 0;

      return state;
    }
  }
}
// #endregion
