import { actions } from "./slice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { MultiCallTaskConfig } from "ethereum/types";

export function useDataListener(
  kind: MultiCallTaskConfig["kind"],
  spender: string,
  tokens: string[]
) {
  const dispatch = useDispatch();

  useEffect(() => {
    const listenerId = (dispatch(
      actions.listenerRegistered({
        id: "",
        kind,
        args: {
          spender,
          tokens,
        },
      })
    ) as unknown) as string;

    return () => {
      dispatch(actions.listenerUnregistered(listenerId));
    };
  }, [dispatch, kind, spender, tokens]);
}
