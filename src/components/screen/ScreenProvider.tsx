import {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import noop from "lodash.noop";

export interface ScreenContextInterface {
  adjustScreen(values: Partial<ScreenContextInterface>): void;
  title: ReactNode;
  subtitle: ReactNode;
  extra: ReactNode;
  actions: ReactNode;
  hasPageHeader: boolean;
}

export const screenContextState: ScreenContextInterface = {
  adjustScreen: noop,
  title: "Foo",
  subtitle: "Bar",
  extra: null,
  actions: null,
  hasPageHeader: true,
};

export const ScreenContext = createContext(screenContextState);

export function ScreenProvider({ children }: { children: ReactNode }) {
  const [
    { title, subtitle, extra, actions, hasPageHeader },
    setValues,
  ] = useState<ScreenContextInterface>(screenContextState);
  const adjustScreen = useCallback(
    (values: Partial<ScreenContextInterface>) =>
      setValues((prev) => ({
        ...prev,
        ...values,
      })),
    []
  );
  const value = useMemo(
    () => ({
      adjustScreen,
      title,
      subtitle,
      extra,
      actions,
      hasPageHeader,
    }),
    [adjustScreen, title, subtitle, extra, actions, hasPageHeader]
  );

  return (
    <ScreenContext.Provider value={value}>{children}</ScreenContext.Provider>
  );
}
