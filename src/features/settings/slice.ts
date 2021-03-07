import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { AppState } from "../store";
import type { SupportedLanguageCode } from "../../i18n";

type Theme = "dark" | "light";

interface SettingsState {
  languageCode: SupportedLanguageCode;
  theme: Theme;
  connected: boolean;
  connectionEnabled: boolean;
}

const slice = createSlice({
  name: "settings",
  initialState: {
    languageCode: "en-us",
    theme: "light",
    connected: false,
    connectionEnabled: true,
  } as SettingsState,
  reducers: {
    languageChanged: (state, action: PayloadAction<SupportedLanguageCode>) => {
      state.languageCode = action.payload;
    },
    themeChanged: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    themeToggled: (state) => {
      state.theme = state.theme === "dark" ? "light" : "dark";
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
  selectSettings: (state: AppState) => state.settings,
  selectTheme: (state: AppState) => state.settings.theme,
  selectConnected: (state: AppState) => state.settings.connected,
  selectConnectionEnabled: (state: AppState) =>
    state.settings.connectionEnabled,
  selectLanguageName: (state: AppState) => {
    const lookup = {
      "en-us": "English",
      "es-mx": "Spanish",
      "zh-cn": "Chinese",
    };

    return lookup[state.settings.languageCode] ?? "None";
  },
};

export default slice.reducer;
