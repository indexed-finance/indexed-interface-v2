import { AppState, FormattedIndexPool, actions, selectors } from "features";
import { ApprovalStatus } from "features/user/slice";
import { Trade } from "@uniswap/sdk";
import { getRandomEntries } from "helpers";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

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
  status: ApprovalStatus;
  approve: () => void;
}

export function useTokenApproval({
  spender,
  token,
  amount
}: TokenApprovalOptions): TokenApprovalHook {
  const dispatch = useDispatch();
  // useTokenUserDataListener(spender, [token]);

  const status = useSelector((state: AppState) =>
    selectors.selectApprovalStatus(
      state,
      spender.toLowerCase(),
      token.toLowerCase(),
      amount
    )
  );

  const approve = useCallback(() => {
    if (spender && status === ApprovalStatus.APPROVAL_NEEDED) {
      dispatch(
        actions.approveSpender(spender, token.toLowerCase(), amount.toString())
      );
    }
  }, [dispatch, status, token, spender, amount]);

  return {
    status,
    approve
  }
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


type Asset = { name: string; symbol: string; id: string; };
type TokenSide = { token: string; amount: number };
type Props = {
  defaultInput: string;
  defaultOutput: string;
}
export function useTradeState({
  defaultInput,
  defaultOutput
}: Props) {
  const [trade, setTrade] = useState<Trade | undefined>();
  const [input, setInput] = useState<TokenSide>({ token: defaultInput, amount: 0 });
  const [output, setOutput] = useState<TokenSide>({ token: defaultOutput, amount: 0 });
}