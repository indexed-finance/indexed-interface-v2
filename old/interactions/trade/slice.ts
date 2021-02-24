import { BaseToken, GraphqlService, Token, UniswapService } from "services";
import {
  DEFAULT_DECIMAL_COUNT,
  TRADE_PRICE_INPUT_MODIFIER,
  TRADE_PRICE_OUTPUT_MODIFIER,
} from "config";
import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  formatBalance,
  toBN,
  toTokenAmount,
} from "@indexed-finance/indexed.js";
import { indexPoolsSelectors, tokensSelectors } from "features/models";
import appSettings from "settings.json";
import type { AppState, AppThunk, TokenField } from "features/store";

interface TradeState {
  input: TokenField;
  output: TokenField;
  price: string;
  maxPrice: string;
}

const slice = createSlice({
  name: "trade",
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
  } as TradeState,
  reducers: {
    inputChanged: (state, action: PayloadAction<TokenField>) => {
      state.input = action.payload;
    },
    outputChanged: (state, action: PayloadAction<TokenField>) => {
      state.output = action.payload;
    },
    priceCalculated: (state, action: PayloadAction<string>) => {
      state.price = action.payload;
    },
  },
});

export const { actions } = slice;

export const thunks = {
  ...actions,
  startTrade: (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const price = await GraphqlService.getEthereumPrice();
    const inputToken = indexPoolsSelectors.selectActiveIndexPoolTokenData(
      state
    );
    const [outputToken] = (appSettings.whitelist as Record<
      string,
      BaseToken[]
    >)["mainnet" as string];

    if (inputToken && outputToken) {
      dispatch(
        actions.inputChanged({
          amount: "0.00",
          token: inputToken.symbol,
        })
      );
      dispatch(
        actions.outputChanged({
          amount: "0.00",
          token: outputToken.symbol,
        })
      );

      dispatch(actions.priceCalculated(price));
    }
  },
  changeTradeField: (
    side: "input" | "output",
    amount: string
  ): AppThunk => async (dispatch, getState, service) => {
    // First, change the trade state to reflect the new value.
    const state = getState();
    const { token } = state.trade[side];
    const fieldSetter =
      side === "input" ? actions.inputChanged : actions.outputChanged;
    const formattedAmount = toTokenAmount(amount, DEFAULT_DECIMAL_COUNT);

    dispatch(
      fieldSetter({
        amount: formattedAmount.toString(),
        token,
      })
    );

    // Next, calculate what the other field should be.
    const updatedState = getState();
    const activeIndexPool = indexPoolsSelectors.selectActiveIndexPool(
      updatedState
    );

    if (activeIndexPool && service.provider) {
      const indexPoolToken = {
        symbol: activeIndexPool.symbol,
        address: activeIndexPool.addresses.index,
        decimals: DEFAULT_DECIMAL_COUNT,
      } as BaseToken;
      const [whitelistedToken] = (appSettings.whitelist as Record<
        string,
        BaseToken[]
      >)["mainnet" as string];
      const inputTokenData = indexPoolToken;
      const outputTokenData = whitelistedToken;

      if (inputTokenData && outputTokenData) {
        const options =
          side === "input"
            ? {
                other: {
                  amount: toBN(state.trade.output.amount),
                  token: state.trade.output.token,
                  changed: actions.outputChanged,
                },
                modifier: TRADE_PRICE_INPUT_MODIFIER,
              }
            : {
                other: {
                  amount: toBN(state.trade.input.amount),
                  token: state.trade.input.token,
                  changed: actions.inputChanged,
                },
                modifier: TRADE_PRICE_OUTPUT_MODIFIER,
              };
        const uniswap = new UniswapService(
          service.provider,
          indexPoolToken,
          service.account
        );

        await uniswap.refresh();

        const correctAmount =
          side === "input"
            ? await uniswap.getAmountOut(
                inputTokenData.address,
                outputTokenData.address,
                toBN(amount)
              )
            : await uniswap.getAmountIn(
                inputTokenData.address,
                outputTokenData.address,
                toBN(amount)
              );
        const formattedAmount = toBN(correctAmount.times(options.modifier));

        if (!formattedAmount.isEqualTo(options.other.amount)) {
          dispatch(
            options.other.changed({
              amount: formattedAmount.toString(),
              token: options.other.token,
            })
          );
        }

        dispatch(thunks.calculateTradePrice());
      }
    }
  },
  calculateTradePrice: (): AppThunk => async (dispatch, getState, service) => {
    const state = getState();
    const activeIndexPool = indexPoolsSelectors.selectActiveIndexPool(state);

    if (activeIndexPool) {
      const { input, output, price } = selectors.selectTrade(state);
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
          18
        );

        if (precisePrice.toString() !== price) {
          dispatch(actions.priceCalculated(precisePrice.toString()));
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
        const precisePrice = toTokenAmount(preciseOutputValue.div(toBN(1)), 18);

        if (precisePrice.toString() !== price) {
          dispatch(actions.priceCalculated(precisePrice.toString()));
        }
      }
    }
  },
  flipTradeFields: (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const { input, output } = selectors.selectTrade(state);

    dispatch(
      actions.inputChanged({
        amount: output.amount,
        token: output.token,
      })
    );

    dispatch(
      actions.outputChanged({
        amount: input.amount,
        token: input.token,
      })
    );
  },
};

export const selectors = {
  selectTrade: (state: AppState) => state.trade,
  selectFormattedTradeFields: (state: AppState) => {
    const { input, output } = selectors.selectTrade(state);
    const activeIndexPool = indexPoolsSelectors.selectActiveIndexPool(state);

    if (activeIndexPool) {
      const indexPoolToken = {
        symbol: activeIndexPool.symbol,
        address: activeIndexPool.addresses.index,
        decimals: DEFAULT_DECIMAL_COUNT,
      } as BaseToken;
      const [whitelistedToken] = (appSettings.whitelist as Record<
        string,
        BaseToken[]
      >)["mainnet" as string];
      const mainTokenIsIndexPoolToken =
        state.trade.input.token === indexPoolToken.symbol;
      const inputTokenData = mainTokenIsIndexPoolToken
        ? indexPoolToken
        : whitelistedToken;
      const outputTokenData = mainTokenIsIndexPoolToken
        ? whitelistedToken
        : indexPoolToken;

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
      }
    }

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
  },
};

export default slice.reducer;
