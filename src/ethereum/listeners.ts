import { actions } from "features";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

export function useTokenUserDataListener(spender: string, tokens: string[]) {
  console.log(`Rendering useTokenUserDataListener`);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(`!! Run effect for listener !!`);
    const listenerId = (dispatch(
      actions.registerTokenUserDataListener(spender, tokens)
    ) as unknown) as string;
    console.log(`!! Attached listener ${listenerId} !!`);
    dispatch(actions.sendBatch());

    return () => {
      console.log(`!! Run cleanup for listener !!`);
      console.log(`!! Detach listenr ${listenerId} !!`)
      dispatch(actions.listenerUnregistered(listenerId));
    }
  }, [dispatch, spender, tokens]);
}