import { RegisteredCall, actions } from "features";
import { isEqual } from "lodash";
import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";

export type DataReceiverConfig = {
  calls: RegisteredCall[];
  priority?: "high" | "low" | number;
};

export default function useCallRegistrar({ calls }: DataReceiverConfig) {
  const dispatch = useDispatch();
  const cachedCalls = useRef(calls);

  useEffect(() => {
    if (!isEqual(calls, cachedCalls.current)) {
      cachedCalls.current = calls;
    }
  });

  useEffect(() => {
    dispatch(actions.registrantRegistered(cachedCalls.current));

    return () => {
      dispatch(actions.registrantUnregistered(cachedCalls.current));
    };
  }, [dispatch]);
}
