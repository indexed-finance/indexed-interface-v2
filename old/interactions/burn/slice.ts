import { BaseToken } from "services";
import { DEFAULT_DECIMAL_COUNT } from "config";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  formatBalance,
  toBN,
  toTokenAmount,
} from "@indexed-finance/indexed.js";
import { indexPoolsSelectors, tokensSelectors } from "features/models";
import type { AppState, AppThunk, TokenField } from "features/store";

interface State {
  input: TokenField;
  options: {
    symbols: string[];
    tokens: Record<string, TokenField>;
    selected: boolean | string;
  };
}

const slice = createSlice({
  name: "burn",
  initialState: {
    input: {
      amount: "",
      token: "",
    },
    options: {
      symbols: [],
      tokens: {},
      selected: false,
    },
  } as State,
  reducers: {
    burnInputChanged: (state, action: PayloadAction<TokenField>) => {
      state.input = action.payload;
    },
    burnOptionsCreated: (state, action: PayloadAction<TokenField[]>) => {
      const symbols = action.payload.map(({ token }) => token);
      const tokens = action.payload.reduce((prev, next) => {
        prev[next.token] = next;
        return prev;
      }, {} as Record<string, TokenField>);

      state.options = {
        symbols,
        tokens,
        selected: true,
      };
    },
    burnOptionSelected: (state, action: PayloadAction<string>) => {
      if (state.options.selected === action.payload) {
        state.options.selected = true;
      } else {
        state.options.selected = action.payload;
      }

      // When switching from one single to another, clear other values out.
      if (typeof state.options.selected === "string") {
        const others = state.options.symbols.filter(
          (token) => token !== state.options.selected
        );

        for (const other of others) {
          const relevantToken = state.options.tokens[other];

          relevantToken.amount = "0";
        }
      }
    },
    burnOptionAmountChanged: (
      state,
      action: PayloadAction<{ amount: string; token: string }>
    ) => {
      state.options.tokens[action.payload.token].amount = action.payload.amount;
    },
  },
});

export const { actions } = slice;

export const thunks = {
  ...actions,
  startBurn: (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const activeIndexPool = indexPoolsSelectors.selectActiveIndexPool(state);

    if (activeIndexPool) {
      dispatch(
        actions.burnInputChanged({
          amount: "0",
          token: activeIndexPool.symbol,
        })
      );

      dispatch(
        actions.burnOptionsCreated(
          activeIndexPool.tokens.map((token) => ({
            amount: "0",
            token,
          }))
        )
      );
    }
  },
  changeBurnField: (amount: string): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const token = selectors.selectActiveBurnToken(state);
    const formattedAmount = toTokenAmount(
      amount,
      DEFAULT_DECIMAL_COUNT
    ).toString();

    dispatch(
      actions.burnInputChanged({
        amount: formattedAmount,
        token,
      })
    );
  },
  changeBurnSubfield: (token: string, amount: string): AppThunk => async (
    dispatch
  ) => {
    const formattedAmount = toTokenAmount(
      amount,
      DEFAULT_DECIMAL_COUNT
    ).toString();

    dispatch(
      actions.burnOptionAmountChanged({
        token,
        amount: formattedAmount,
      })
    );
  },
};

export const selectors = {
  selectBurn: (state: AppState) => state.burn,
  selectActiveBurnToken: (state: AppState) =>
    selectors.selectBurn(state).input.token,
  selectSelectedBurnToken: (state: AppState) => {
    const { options } = selectors.selectBurn(state);
    const { selected } = selectors.selectBurn(state).options;

    if (selected === true) {
      return true;
    } else if (selected) {
      return options.tokens[selected];
    } else {
      return null;
    }
  },
  selectFormattedBurnFields: (state: AppState) => {
    const { input, options } = selectors.selectBurn(state);
    const activeIndexPool = indexPoolsSelectors.selectActiveIndexPool(state);

    if (activeIndexPool) {
      const tokens = tokensSelectors.selectTokensByIndexPool(
        state,
        activeIndexPool
      );
      const indexPoolToken = {
        symbol: activeIndexPool.symbol,
        address: activeIndexPool.addresses.index,
        decimals: DEFAULT_DECIMAL_COUNT,
      } as BaseToken;

      if (indexPoolToken) {
        const inputValue = formatBalance(
          toBN(input.amount),
          indexPoolToken.decimals,
          4
        );

        return {
          input: {
            value: parseFloat(inputValue),
            token: input.token,
          },
          options: tokens.map((token) => {
            const amount = options.tokens[token.symbol]
              ? formatBalance(
                  toBN(options.tokens[token.symbol].amount),
                  DEFAULT_DECIMAL_COUNT,
                  4
                )
              : "0";

            return {
              selected:
                options.selected === token.symbol || options.selected === true,
              amount: parseFloat(amount),
              symbol: token.symbol,
              name: token.name,
            };
          }),
        };
      }
    }

    return {
      input: {
        value: parseFloat(input.amount) || 0,
        token: input.token,
      },
      options: [],
    };
  },
};

export default slice.reducer;
