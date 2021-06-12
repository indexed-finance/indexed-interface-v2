import { AnyAction } from "redux";
import { FEATURE_FLAGS } from "feature-flags";
import { LOCALSTORAGE_KEY, LOCALSTORAGE_VERSION_NUMBER } from "config";
import { ThunkAction } from "redux-thunk";
import { configureStore } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { middleware } from "./middleware";
import { rootReducer } from "./reducer";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(middleware),
  preloadedState: FEATURE_FLAGS.useSessionSaving
    ? loadPersistedState()
    : undefined,
});

const persistState = debounce(() => {
  try {
    const { batcher, ...toSave } = store.getState();
    const saved = {
      when: Date.now(),
      what: toSave,
      version: LOCALSTORAGE_VERSION_NUMBER,
    };

    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Persistence not available.
  }
}, 250);

store.subscribe(persistState);

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
      const { when, what: state, version } = JSON.parse(persistedState);
      const oneDay = 1000 * 60 * 60 * 24;
      const isFresh = Date.now() - when <= oneDay;
      const isRightVersion = version && version === LOCALSTORAGE_VERSION_NUMBER;

      return isFresh && isRightVersion ? state : undefined;
    }
  }
}
// #endregion
