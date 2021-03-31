import { useEffect } from "react";
import { useHistory } from "react-router-dom";

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
