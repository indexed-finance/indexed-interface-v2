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
  title: ReactNode;
  children: ReactNode;
  padding?: number;
  width?: number;
  top?: number;
  style?: DrawerProps["style"];
  bodyStyle?: DrawerProps["style"];
  onClose(): void;
}

export function BaseDrawer({
  title,
  onClose,
  children,
  padding = 0,
  width = 400,
  top = 64,
  style = {},
  bodyStyle = {},
  mask,
  ...rest
}: BaseDrawerProps) {
  return (
    <Drawer
      title={title}
      placement="right"
      closable={true}
      onClose={onClose}
      visible={true}
      mask={mask}
      bodyStyle={{ padding, ...bodyStyle }}
      contentWrapperStyle={{
        width,
      }}
      style={{
        position: "fixed",
        top,
        right: 0,
        zIndex: 100,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Drawer>
  );
}
