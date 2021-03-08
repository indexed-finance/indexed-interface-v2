import { AnyAction } from "redux";
import { LOCALSTORAGE_KEY } from "config";
import { ThunkAction } from "redux-thunk";
import { batcherActions } from "./batcher";
import { configureStore } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import reducer from "./reducer";
// blockNumberChanged
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
      }),
  preloadedState: loadPersistedState(),
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

    return persistedState ? JSON.parse(persistedState) : undefined;
  } catch (error) {
    return undefined;
  }
}
// #endregion
