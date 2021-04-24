import { Drawer, DrawerProps } from "antd";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import noop from "lodash.noop";

export interface DrawerContextInterface {
  active: ReactNode;
  open(content: ReactNode): void;
  close(): void;
}

export const DrawerContext = createContext<DrawerContextInterface>({
  active: false,
  open: noop,
  close: noop,
});

export function useDrawer() {
  return useContext(DrawerContext);
}

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ReactNode>(null);
  const close = useCallback(() => setActive(false), []);
  const open = setActive;
  const value = useMemo(
    () => ({
      active,
      close,
      open,
    }),
    [active, close, open]
  );

  return (
    <DrawerContext.Provider value={value}>
      {children}
      {active}
    </DrawerContext.Provider>
  );
}

export interface BaseDrawerProps extends DrawerProps {
  title: string;
  children: ReactNode;
  style?: DrawerProps["style"];
  bodyStyle?: DrawerProps["style"];
  onClose(): void;
}

export function BaseDrawer({
  title,
  onClose,
  children,
  style = {},
  bodyStyle = {},
  ...rest
}: BaseDrawerProps) {
  return (
    <Drawer
      title={title}
      placement="right"
      closable={true}
      onClose={onClose}
      visible={true}
      mask={false}
      bodyStyle={{ padding: 0, ...bodyStyle }}
      style={{
        position: "fixed",
        top: 64,
        right: 0,
        zIndex: 100,
        width: 400,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Drawer>
  );
}
