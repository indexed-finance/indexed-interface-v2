import { AnyAction } from "redux";
import { LOCALSTORAGE_KEY } from "config";
import { ThunkAction } from "redux-thunk";
import { batcherActions } from "./batcher";
import { configureStore } from "@reduxjs/toolkit";
import { disconnectFromProvider } from "./thunks";
import { userActions } from "./user";
import { v4 as uuid } from "uuid";
import flags from "feature-flags";
import reducer from "./reducer";

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    })
      // The listener ID is returned for later use in unregistering.
      .concat(function listenerIdMiddleware() {
        return (next) => (action) => {
          if (action.type === batcherActions.listenerRegistered.type) {
            const id = uuid();

            next({
              ...action,
              payload: {
                ...action.payload,
                id,
              },
            });

            return id;
          } else {
            return next(action);
          }
        };
      })
      // When the user disconnects, remove the global provider and signer.
      .concat(function userDisconnectionMiddleware() {
        return (next) => (action) => {
          if (action.type === userActions.userDisconnected.type) {
            disconnectFromProvider();
          }

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
