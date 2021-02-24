import { DEFAULT_DECIMAL_COUNT, SPOT_PRICE_MODIFIER } from "config";
import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Token } from "services";
import {
  formatBalance,
  toBN,
  toTokenAmount,
} from "@indexed-finance/indexed.js";
import { indexPoolsSelectors, tokensSelectors } from "features/models";
import type { AppState, AppThunk, TokenField } from "features/store";

interface SwapState {
  input: TokenField;
  output: TokenField;
  price: string;
  maxPrice: string;
}

const slice = createSlice({
  name: "swap",
  initialState: {
    input: {
      amount: "",
      token: "",
    },
    output: {
      amount: "",
      token: "",
    },
    price: "",
    maxPrice: "",
  } as SwapState,
  reducers: {
    swapInputChanged: (state, action: PayloadAction<TokenField>) => {
      state.input = action.payload;
    },
    swapOutputChanged: (state, action: PayloadAction<TokenField>) => {
      state.output = action.payload;
    },
    swapPriceCalculated: (state, action: PayloadAction<string>) => {
      state.price = action.payload;
    },
    swapMaxPriceCalculated: (state, action: PayloadAction<string>) => {
      state.maxPrice = action.payload;
    },
  },
});

export const { actions } = slice;

export const thunks = {
  ...actions,
  calculateSwapPrice: (): AppThunk => async (dispatch, getState, service) => {
    const state = getState();
    const activeIndexPool = indexPoolsSelectors.selectActiveIndexPool(state);

    if (activeIndexPool) {
      const { input, output, price } = selectors.selectSwap(state);
      const tokensBySymbol = tokensSelectors.selectEntities(
        state
      ) as Dictionary<Token>;
      const inputTokenData = tokensBySymbol[input.token];
      const inputDecimals = inputTokenData?.decimals || DEFAULT_DECIMAL_COUNT;
      const outputTokenData = tokensBySymbol[output.token];
      const inputValue = toBN(input.amount);
      const outputValue = toBN(output.amount);

      if (inputValue.isGreaterThan(0) && outputValue.isGreaterThan(0)) {
        // Calculate the price ourselves.
        const divisor = toBN(10).pow(inputDecimals);
        const preciseInputValue = inputValue.div(divisor);
        const preciseOutputValue = outputValue.div(divisor);
        const precisePrice = toTokenAmount(
          preciseOutputValue.div(preciseInputValue),
          inputDecimals
        );

        if (precisePrice.toString() !== price) {
          dispatch(actions.swapPriceCalculated(precisePrice.toString()));
        }
      } else {
        // Use the spot price.
        const calculators = service.getCalculatorsFor(
          activeIndexPool.addresses.primary
        );
        const anyOldToken = toBN(10).pow(inputDecimals);
        const { amount } = await calculators.outputToInput(
          inputTokenData?.address || "",
          outputTokenData?.address || "",
          anyOldToken
        );
        const preciseOutputValue = toBN(amount).div(anyOldToken);
        const precisePrice = toTokenAmount(
          preciseOutputValue.div(toBN(1)),
          inputDecimals
        );

        if (precisePrice.toString() !== price) {
          dispatch(actions.swapPriceCalculated(precisePrice.toString()));
        }
      }
    }
  },
  startSwap: (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const tokens = indexPoolsSelectors.selectActiveIndexPoolTokens(state);

    if (tokens.length >= 2) {
      const [firstToken, secondToken] = tokens;

      dispatch(
        actions.swapInputChanged({
          amount: "0",
          token: firstToken.symbol,
        })
      );
      dispatch(
        actions.swapOutputChanged({
          amount: "0",
          token: secondToken.symbol,
        })
      );

      dispatch(thunks.calculateSwapPrice());
    }
  },
  changeSwapField: (
    side: "input" | "output",
    amount: string
  ): AppThunk => async (dispatch, getState, service) => {
    // First, change the swap state to reflect the new value.
    const state = getState();
    const tokens = tokensSelectors.selectEntities(state);
    const { token } = state.swap[side];
    const tokenData = tokens[token];
    const fieldSetter =
      side === "input" ? actions.swapInputChanged : actions.swapOutputChanged;
    const formattedAmount = toTokenAmount(
      amount,
      tokenData?.decimals || DEFAULT_DECIMAL_COUNT
    );

    dispatch(
      fieldSetter({
        amount: formattedAmount.toString(),
        token,
      })
    );

    // Next, calculate what the other field should be.
    const updatedState = getState();
    const activeIndexPool = indexPoolsSelectors.selectActiveIndexPool(state);

    if (activeIndexPool) {
      const calculators = service.getCalculatorsFor(
        activeIndexPool.addresses.primary
      );
      const tokensBySymbol = tokensSelectors.selectEntities(updatedState);
      const inputTokenData = tokensBySymbol[state.swap.input.token];
      const outputTokenData = tokensBySymbol[state.swap.output.token];

      if (inputTokenData && outputTokenData) {
        const settings =
          side === "input"
            ? {
                usedBalance: inputTokenData.used.balance,
                divisor: 2,
                decimals: inputTokenData.decimals,
                calculationFn: calculators.inputToOutput.bind(
                  null,
                  inputTokenData.address,
                  outputTokenData.address
                ),
                other: state.swap.output,
                otherChanged: actions.swapOutputChanged,
              }
            : {
                usedBalance: outputTokenData.used.balance,
                divisor: 3,
                decimals: outputTokenData.decimals,
                calculationFn: calculators.outputToInput.bind(
                  null,
                  outputTokenData.address,
                  inputTokenData.address
                ),
                other: state.swap.input,
                otherChanged: actions.swapInputChanged,
              };
        const usedBalance = toBN(settings.usedBalance);
        const balanceToCompare = usedBalance.div(settings.divisor);
        const fieldAmountInTokens = toTokenAmount(
          toBN(amount),
          settings.decimals
        );
        if (fieldAmountInTokens.isLessThanOrEqualTo(balanceToCompare)) {
          const correctResult = await settings.calculationFn(
            fieldAmountInTokens
          );
          const maxPrice = correctResult.spotPriceAfter.times(
            SPOT_PRICE_MODIFIER
          );

          dispatch(actions.swapMaxPriceCalculated(maxPrice.toString()));

          const formattedAmount = toBN(correctResult.amount);

          if (!formattedAmount.isEqualTo(toBN(settings.other.amount))) {
            dispatch(
              settings.otherChanged({
                amount: formattedAmount.toString(),
                token: settings.other.token,
              })
            );
          }

          dispatch(thunks.calculateSwapPrice());
        }
      }
    }
  },
  flipSwapFields: (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const { input, output } = selectors.selectSwap(state);

    dispatch(thunks.changeSwapField("input", output.amount));

    dispatch(
      actions.swapInputChanged({
        amount: output.amount,
        token: output.token,
      })
    );

    dispatch(
      actions.swapOutputChanged({
        amount: input.amount,
        token: input.token,
      })
    );
  },
};

export const selectors = {
  selectSwap: (state: AppState) => state.swap,
  selectFormattedSwapFields: (state: AppState) => {
    const { input, output } = selectors.selectSwap(state);
    const tokens = tokensSelectors.selectEntities(state);
    const inputTokenData = tokens[input.token];
    const outputTokenData = tokens[output.token];

    if (inputTokenData && outputTokenData) {
      const inputValue = formatBalance(
        toBN(input.amount),
        inputTokenData.decimals,
        4
      );
      const outputValue = formatBalance(
        toBN(output.amount),
        outputTokenData.decimals,
        4
      );

      return {
        input: {
          value: parseFloat(inputValue),
          token: input.token,
        },
        output: {
          value: parseFloat(outputValue),
          token: output.token,
        },
      };
    } else {
      return {
        input: {
          value: parseFloat(input.amount) || 0,
          token: input.token,
        },
        output: {
          value: parseFloat(output.amount) || 0,
          token: output.token,
        },
      };
    }
  },
};

export default slice.reducer;
