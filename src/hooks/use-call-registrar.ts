import { DataReceiverConfig, actions, selectors } from "features";
import { isEqual } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";

export default function useCallRegistrar(calls: DataReceiverConfig) {
  const dispatch = useDispatch();
  const cachedCalls = useRef(calls);
  const isConnected = useSelector(selectors.selectConnected);

  // Effect:
  // Handle updates "gracefully" in a McJanky way.
  useEffect(() => {
    if (!isEqual(calls, cachedCalls.current)) {
      cachedCalls.current = calls;
    }
  });

  // Effect:
  // Register a multicall listener that queries certain functions every update.
  // Note: if the user is connected, defer all updates to the server.
  useEffect(() => {
    if (!isConnected) {
      const _cachedCalls = cachedCalls.current;

      if (_cachedCalls) {
        const allCalls = {
          caller: _cachedCalls.caller,
          onChainCalls: _cachedCalls.onChainCalls ?? [],
          offChainCalls: _cachedCalls.offChainCalls ?? [],
        };

        dispatch(actions.registrantRegistered(allCalls));

        return () => {
          dispatch(actions.registrantUnregistered(allCalls));
        };
      }
    }
  }, [dispatch, isConnected]);

  // Effect:
  // When a call is first registered,
  //  a) check the cache, or
  // b) independently query for results separate from the common batch.
  useEffect(() => {
    dispatch(actions.independentlyQuery(cachedCalls.current));
  }, [dispatch, calls.caller]);
}
