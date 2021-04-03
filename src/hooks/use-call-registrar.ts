import { DataReceiverConfig, actions, selectors } from "features";
import { isEqual } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";

export function useCallRegistrar(calls: DataReceiverConfig) {
  const dispatch = useDispatch();
  const cachedCalls = useRef(calls);
  const blockNumber = useSelector(selectors.selectBlockNumber);
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

        dispatch(actions.callsRegistered(allCalls));

        return () => {
          dispatch(actions.callsUnregistered(allCalls));
        };
      }
    }
  }, [dispatch, isConnected]);

  // Effect:
  // To get data to the user as quickly as possible,
  // we can trigger a changeBlockNumber thunk with the current block number.
  // As the batch is being selected, it will ignore any calls for which it already has data.
  useEffect(() => {
    if (!isConnected && blockNumber !== -1) {
      dispatch(actions.sendBatch());
    }
  }, [dispatch, isConnected, blockNumber]);
}
