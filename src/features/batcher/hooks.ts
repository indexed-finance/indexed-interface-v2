import { MultiCallTaskConfig } from "ethereum";
import { actions } from "./slice";
import { isEqual } from "lodash";
import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";

export function useDataListener<TaskConfig extends MultiCallTaskConfig = MultiCallTaskConfig>(
  kind: TaskConfig["kind"],
  args: TaskConfig["args"],
) {
  const dispatch = useDispatch();
  // Jank solution to prevent obj identity from triggering effects
  const argsRef = useRef(args);
  if (!isEqual(argsRef.current, args)) {
    argsRef.current = args;
  }

  useEffect(() => {
    const listenerId = (dispatch(
      actions.listenerRegistered({
        id: "",
        kind,
        args: argsRef.current,
      } as any)
    ) as unknown) as string;

    return () => {
      dispatch(actions.listenerUnregistered(listenerId));
    };
  }, [dispatch, kind, argsRef]);
}

export const useTokenUserDataListener = (spender: string, tokens: string[]) =>
  useDataListener("TokenUserData", { spender, tokens });

export const usePoolDataListener = (pool: string, tokens: string[]) =>
  useDataListener("PoolData", { pool, tokens });