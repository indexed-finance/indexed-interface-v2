import { MultiCallTaskConfig } from "ethereum";
import { actions } from "./slice";
import { isEqual } from "lodash";
import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";

export function useDataListener<
  TaskConfig extends MultiCallTaskConfig = MultiCallTaskConfig
>(kind: TaskConfig["kind"], args: TaskConfig["args"]) {
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

export const useTotalSuppliesListener = (tokens: string[]) =>
  useDataListener("TotalSupplies", tokens);

// === //
type Call = {
  spender: string;
  function: string;
  args?: string[];
};

type DataReceiverConfig = {
  registrant: string;
  calls: Call[];
  priority?: "high" | "low" | number;
};

export function useCallRegistrar({ registrant, calls }: DataReceiverConfig) {
  const dispatch = useDispatch();
  const cachedCalls = useRef(calls);

  useEffect(() => {
    if (!isEqual(calls, cachedCalls.current)) {
      cachedCalls.current = calls;
    }
  });

  useEffect(() => {
    dispatch(
      actions.registrantRegistered({
        registrant,
        calls: cachedCalls.current,
      })
    );

    return () => {
      dispatch(actions.registrantUnregistered(registrant));
    };
  }, [dispatch, registrant]);
}

export function usePoolDetailRegistrar(
  poolAddress: string,
  tokenIds: string[]
) {
  const cachedTokenIds = useRef(tokenIds);
  const spender = poolAddress;
  const tokenCalls = cachedTokenIds.current.reduce((prev, next) => {
    prev.push(
      {
        spender,
        function: "getBalance",
        args: [next],
      },
      {
        spender,
        function: "getMinimumBalance",
        args: [next],
      },
      {
        spender,
        function: "getDenormalizedWeight",
        args: [next],
      }
    );

    return prev;
  }, [] as Call[]);
  const poolCalls = [
    {
      spender,
      function: "getTotalDenormalizedWeight",
    },
    {
      spender,
      function: "totalSupply",
    },
    {
      spender,
      function: "getSwapFee",
    },
    ...tokenCalls,
  ];

  useCallRegistrar({
    registrant: poolAddress,
    calls: poolCalls,
  });
}
