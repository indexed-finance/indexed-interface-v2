import { AppState, FormattedIndexPool, actions, selectors } from "features";
import { SubscreenContext } from "app/subscreens/Subscreen";
import { convert, getRandomEntries } from "helpers";
import { useCallback, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import noop from "lodash.noop";

// Effect:
// On initial token load, select two to swap.
export function useTokenRandomizer(options: TokenRandomizerOptions) {
  useEffect(() => {
    if (options.pool) {
      const { assets: tokens } = options.pool;

      if (!options.from && !options.to && tokens.length > 1) {
        const [fromToken, toToken] = getRandomEntries(2, tokens);

        options.changeFrom(fromToken.symbol);
        options.changeTo(toToken.symbol);

        if (options.callback) {
          options.callback();
        }
      }
    }
  }, [options]);
}

// Effect:
// Given a pool and token, provide properties and methods associated with token approval.
export function useTokenApproval({
  pool,
  from,
  to,
  onSendTransaction = noop,
}: TokenApprovalOptions) {
  const dispatch = useDispatch();
  const { setActions } = useContext(SubscreenContext);
  const needsApproval = useSelector((state: AppState) => {
    if (pool) {
      const { token, amount } = from;
      return selectors.selectApprovalStatus(
        state,
        pool.id,
        token.toLowerCase(),
        convert.toToken(amount.toString()).toString(10)
      );
    }
  });
  const handleApprovePool = useCallback(() => {
    if (pool && needsApproval) {
      const { token, amount } = from;

      dispatch(
        actions.approvePool(pool.id, token.toLowerCase(), amount.toString())
      );
    }
  }, [dispatch, pool, needsApproval, from]);

  // Effect:
  // Start off with the "Approve" button. When the approval finishes, the callback will change to "Send Transaction."
  useEffect(
    () =>
      setActions([
        {
          type: "primary",
          title: "Approve",
          onClick: handleApprovePool,
        },
      ]),
    [setActions, handleApprovePool]
  );

  // Effect:
  // When approved, call the optional callback.
  useEffect(() => {
    if (!needsApproval) {
      setActions([
        {
          type: "primary",
          title: "Send Transaction",
          onClick: () =>
            onSendTransaction({
              from,
              to,
            }),
        },
      ]);
    }
  }, [needsApproval, setActions, onSendTransaction, from, to]);

  return {
    needsApproval,
    handleApprovePool,
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
  from: string;
  to: string;
  changeFrom(symbol: string): void;
  changeTo(symbol: string): void;
  callback?(): void;
};

type TokenSide = { token: string; amount: number };

type TokenApprovalOptions = {
  pool: null | FormattedIndexPool;
  from: TokenSide;
  to: TokenSide;
  onSendTransaction?(values: { from: TokenSide; to: TokenSide }): void;
};
// #endregion
