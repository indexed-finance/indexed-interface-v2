import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { noop } from "lodash";
import ReactDOM from "react-dom";

interface TooltipContextInterface {
  scan(): void;
}

export const TooltipContext = createContext<TooltipContextInterface>({
  scan: noop,
});

export function useTooltips() {
  return useContext(TooltipContext);
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  const scan = useCallback(() => {
    const withTooltips = Array.from(
      document.querySelectorAll("*[data-tooltip]")
    );

    for (const tooltip of withTooltips) {
      // Fix me later.
    }
  }, []);
  const value = useMemo(
    () => ({
      scan,
    }),
    [scan]
  );

  return (
    <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>
  );
}
