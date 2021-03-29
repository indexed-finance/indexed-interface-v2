import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { AppState } from "../store";
import type { SupportedLanguageCode } from "../../i18n";

type Theme = "dark" | "light" | "outrun";

interface SettingsState {
  languageCode: SupportedLanguageCode;
  theme: Theme;
  connected: boolean;
  connectionEnabled: boolean;
}

const isConnectionEnabled = () => {
  const setting = process.env.CONNECTION;
  return typeof setting === "undefined" || setting === "true";
};

const initialState: SettingsState = {
  languageCode: "en-us",
  theme: "dark",
  connected: false,
  connectionEnabled: isConnectionEnabled(),
};

const slice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    languageChanged: (state, action: PayloadAction<SupportedLanguageCode>) => {
      state.languageCode = action.payload;
    },
    themeChanged: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    themeToggled: (state) => {
      const themeOrder = ["light", "dark", "outrun"] as Theme[];
      const currentIndex = themeOrder.findIndex(
        (value) => value === state.theme
      );

      let nextIndex = currentIndex + 1;

      if (!themeOrder[nextIndex]) {
        nextIndex = 0;
      }

      state.theme = themeOrder[nextIndex];
    },
    connectionEstablished: (state) => {
      state.connected = true;
    },
    connectionLost: (state) => {
      state.connected = false;
    },
    connectionToggled: (state) => {
      const connected = !state.connectionEnabled;

      if (connected) {
        state.connectionEnabled = true;
      } else {
        state.connected = false;
        state.connectionEnabled = false;
      }
    },
  },
});

export const { actions } = slice;

export const selectors = {
  selectSettings(state: AppState) {
    return state.settings;
  },
  selectTheme(state: AppState) {
    return state.settings.theme;
  },
  selectConnected(state: AppState) {
    return state.settings.connected;
  },
  selectConnectionEnabled(state: AppState) {
    return state.settings.connectionEnabled;
  },
  selectLanguageName(state: AppState) {
    const lookup = {
      "en-us": "English",
      "es-mx": "Spanish",
      "zh-cn": "Chinese",
    };

    return lookup[state.settings.languageCode] ?? "None";
  },
  selectAvailableLanguages(state: AppState) {
    // wut
  },
};

export default slice.reducer;
