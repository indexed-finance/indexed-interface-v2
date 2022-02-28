import { DataReceiverConfig, actions } from "features";
import { useCachedValue } from "./use-debounce";
import { useChainId } from "./settings-hooks";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

export function useCallRegistrar(calls: DataReceiverConfig) {
  const dispatch = useDispatch();
  const cachedChainId = useChainId();
  const cachedCalls = useCachedValue(calls);

  // Effect:
  // Handle updates "gracefully" in a McJanky way.
  useEffect(() => {
    console.log(`${cachedCalls.caller}: CHANGING CACHED CALLS`)
  }, [cachedCalls]);

  useEffect(() => {
    if (cachedCalls) {
      const allCalls = {
        caller: cachedCalls.caller,
        onChainCalls: cachedCalls.onChainCalls ?? [],
        offChainCalls: cachedCalls.offChainCalls ?? [],
        chainId: cachedChainId
      };

      dispatch(actions.callsRegistered(allCalls));

      return () => {
        dispatch(actions.callsUnregistered(allCalls));
      };
    }
  }, [dispatch, cachedCalls, cachedChainId]);
}
