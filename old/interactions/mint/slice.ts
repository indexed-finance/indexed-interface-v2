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

interface MintState {
  input: TokenField;
  slippage: SlippageRate;
  options: {
    symbols: string[];
    tokens: Record<string, TokenField>;
    selected: boolean | string;
  };
}

export enum SlippageRate {
  OnePercent,
  TwoPercent,
}

const slice = createSlice({
  name: "mint",
  initialState: {
    input: {
      amount: "",
      token: "",
    },
    slippage: SlippageRate.OnePercent,
    options: {
      symbols: [],
      tokens: {},
      selected: false,
    },
  } as MintState,
  reducers: {
    mintInputChanged: (state, action: PayloadAction<TokenField>) => {
      state.input = action.payload;
    },
    mintSlippageChanged: (state, action: PayloadAction<SlippageRate>) => {
      state.slippage = action.payload;
    },
    mintOptionsCreated: (state, action: PayloadAction<TokenField[]>) => {
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
    mintOptionSelected: (state, action: PayloadAction<string>) => {
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
    mintOptionAmountChanged: (
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
  startMint: (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const activeIndexPool = indexPoolsSelectors.selectActiveIndexPool(state);

    if (activeIndexPool) {
      dispatch(
        actions.mintInputChanged({
          amount: "0.00",
          token: activeIndexPool.symbol,
        })
      );

      dispatch(
        actions.mintOptionsCreated(
          activeIndexPool.tokens.map((token) => ({
            amount: "0.00",
            token,
          }))
        )
      );
    }
  },
  changeMintField: (amount: string): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const token = selectors.selectActiveMintToken(state);
    const selectedOption = selectors.selectSelectedMintOption(state);
    const formattedAmount = toTokenAmount(amount, 18).toString();

    dispatch(
      actions.mintInputChanged({
        amount: formattedAmount,
        token,
      })
    );

    if (selectedOption === true) {
      // When `selectedOption` is set to `true`, all options are selected, so calculate using all.
    } else if (selectedOption && typeof selectedOption === "object") {
      // When `selectedOption` is set to a single option, only that option is selected.
      const activeIndexPool = indexPoolsSelectors.selectActiveIndexPool(state);
      const tokens = tokensSelectors.selectEntities(state);
      const singleToken = tokens[selectedOption.token];

      if (activeIndexPool && singleToken) {
        const totalDenorm = indexPoolsSelectors.selectTotalDenorm(state);
        const extrapolatedValueRatio = totalDenorm.div(singleToken.used.denorm);
        const extrapolatedValue = extrapolatedValueRatio.times(
          singleToken.used.balance
        );
        const indexPoolRatio = toBN(formattedAmount).div(
          activeIndexPool.totals.supply
        );
        const swapFee = indexPoolsSelectors.selectSwapFee(state);
        const roughInputEstimate = indexPoolRatio
          .times(extrapolatedValue)
          .times(toBN(1 + swapFee));
        const roughInputEstimateOverHalfBalance = roughInputEstimate.isGreaterThan(
          toBN(singleToken.used.balance).dividedBy(2)
        );
        const amount = roughInputEstimateOverHalfBalance
          ? roughInputEstimate
          : await toBN("23381769328552611542"); // calcSingleInGivenPoolOut

        dispatch(
          actions.mintOptionAmountChanged({
            amount: amount.toString(),
            token: selectedOption.token,
          })
        );
      }
    }
  },
  changeMintSubfield: (token: string, amount: string): AppThunk => async (
    dispatch
  ) => {
    const formattedAmount = toTokenAmount(
      amount,
      DEFAULT_DECIMAL_COUNT
    ).toString();

    dispatch(
      actions.mintOptionAmountChanged({
        token,
        amount: formattedAmount,
      })
    );
  },
};

export const selectors = {
  selectMint: (state: AppState) => state.mint,
  selectActiveMintToken: (state: AppState) =>
    selectors.selectMint(state).input.token,
  selectSelectedMintOption: (state: AppState) => {
    const { options } = selectors.selectMint(state);
    const { selected } = selectors.selectMint(state).options;

    if (selected === true) {
      return true;
    } else if (selected) {
      return options.tokens[selected];
    } else {
      return null;
    }
  },
  selectFormattedMintFields: (state: AppState) => {
    const { input, options } = selectors.selectMint(state);
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
          slippage: state.mint.slippage,
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
      slippage: state.mint.slippage,
      options: [],
    };
  },
};

export default slice.reducer;
