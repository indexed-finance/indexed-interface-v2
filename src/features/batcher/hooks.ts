import { MultiCallTaskConfig } from "ethereum";
import { actions } from "./slice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

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
        kind: kind as any, // ugh.
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
