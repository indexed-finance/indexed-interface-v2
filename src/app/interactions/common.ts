import {
  AppState,
  FormattedIndexPool,
  actions,
  hooks,
  selectors,
} from "features";
import { Foo } from "features/user/slice";
import { convert, getRandomEntries } from "helpers";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

const { useDataListener } = hooks;

export function getSwapCost(outputAmount: number, swapFeePercent: string) {
  return convert
    .toBigNumber(outputAmount.toString(10))
    .times(convert.toBigNumber((parseFloat(swapFeePercent) / 100).toString()))
    .toString(10);
}

// Effect:
// On initial token load, select two to swap.
export function useTokenRandomizer(options: TokenRandomizerOptions) {
  useEffect(() => {
    if (options.pool) {
      const { assets: tokens } = options.pool;

      if (options.hasOwnProperty("from")) {
        if (!options.from && !options.to && tokens.length > 1) {
          const [fromToken, toToken] = getRandomEntries(2, tokens);

          if (options.changeFrom) {
            options.changeFrom(fromToken.symbol);
          }

          options.changeTo(toToken.symbol);

          if (options.callback) {
            options.callback();
          }
        }
      } else {
        if (!options.to && tokens.length > 0) {
          const [toToken] = getRandomEntries(1, tokens);

          options.changeTo(toToken.symbol);

          if (options.callback) {
            options.callback();
          }
        }
      }
    }
  }, [options]);
}

interface TokenApprovalOptions {
  spender: string;
  token: string;
  amount: string;
}

type TokenApprovalHook = {
  status: Foo;
  approve: () => void;
};

export function useTokenApproval({
  spender,
  token,
  amount,
}: TokenApprovalOptions): TokenApprovalHook {
  const dispatch = useDispatch();
  const status = useSelector((state: AppState) =>
    selectors.selectApprovalStatus(
      state,
      spender.toLowerCase(),
      token.toLowerCase(),
      amount
    )
  );
  const approve = useCallback(() => {
    if (spender && status === "approval needed") {
      dispatch(
        actions.approveSpender(spender, token.toLowerCase(), amount.toString())
      );
    }
  }, [dispatch, status, token, spender, amount]);

  useDataListener("TokenUserData", spender, [token]);

  return {
    status,
    approve,
  };
}

// Effect:
// When the page changes, clear the form.
export function useHistoryChangeCallback(callback: () => void) {
  const history = useHistory();

  useEffect(() => {
    const unregister = history.listen(callback);

    return () => {
      unregister();
    };
  }, [history, callback]);
}

// #region Models
type TokenRandomizerOptions = {
  pool: null | FormattedIndexPool;
  from?: string;
  to: string;
  changeFrom?(symbol: string): void;
  changeTo(symbol: string): void;
  callback?(): void;
};
// #endregion
