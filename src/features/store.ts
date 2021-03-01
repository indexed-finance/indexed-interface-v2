import { AnyAction } from "redux";
import { LOCALSTORAGE_KEY } from "config";
import { ThunkAction } from "redux-thunk";
import { configureStore } from "@reduxjs/toolkit";
import reducer from "./reducer";

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
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
export type AppThunk = ThunkAction<void, AppState, undefined, AnyAction>;

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
