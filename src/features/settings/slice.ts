import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { AppState } from "../store";
import type { SupportedLanguageCode } from "../../i18n";

type Theme = "dark" | "light";

interface SettingsState {
  languageCode: SupportedLanguageCode;
  theme: Theme;
}

const slice = createSlice({
  name: "settings",
  initialState: {
    languageCode: "en-us",
    theme: "dark",
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
  },
});

export const { actions } = slice;

export const selectors = {
  selectSettings: (state: AppState) => state.settings,
  selectTheme: (state: AppState) => state.settings.theme,
};

export default slice.reducer;
