import { Drawer, DrawerProps } from "antd";
import {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import noop from "lodash.noop";

export interface DrawerContext {
  active: boolean;
  open(): void;
  close(): void;
  toggle(): void;
}

export const createDrawerContext = () =>
  createContext<DrawerContext>({
    active: false,
    open: noop,
    close: noop,
    toggle: noop,
  });

export const useDrawerControls = () => {
  const [active, setActive] = useState(false);
  const close = useCallback(() => setActive(false), []);
  const open = useCallback(() => setActive(true), []);
  const toggle = useCallback(() => setActive((prev) => !prev), []);
  const controls = useMemo(
    () => ({
      active: active,
      close,
      open,
      toggle,
    }),
    [active, close, open, toggle]
  );

  return controls;
};

export interface BaseDrawerProps {
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
}: BaseDrawerProps) {
  return (
    <Drawer
      title={title}
      placement="right"
      closable={false}
      onClose={onClose}
      visible={true}
      mask={false}
      bodyStyle={{ padding: 0, ...bodyStyle }}
      style={{
        position: "fixed",
        top: 64,
        right: 0,
        zIndex: 30000,
        width: 400,
        ...style,
      }}
    >
      {children}
    </Drawer>
  );
}
