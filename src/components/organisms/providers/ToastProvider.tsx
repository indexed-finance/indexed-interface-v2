import { DEFAULT_TOAST_DISPLAY_TIME_IN_SECONDS } from "config";
import { message } from "antd";
import React, { ReactNode, createContext, useCallback, useMemo } from "react";
import noop from "lodash.noop";

interface Message {
  content: string;
  level: "success" | "warning" | "error";
  durationInSeconds?: number;
}

interface Context {
  addMessage(message: Message): void;
}

interface Props {
  children: ReactNode;
}

export const ToastContext = createContext<Context>({
  addMessage: noop,
});

export default function ToastProvider(props: Props) {
  const addMessage = useCallback(
    (sentMessage: Message) =>
      message[sentMessage.level](
        sentMessage.content,
        sentMessage.durationInSeconds || DEFAULT_TOAST_DISPLAY_TIME_IN_SECONDS
      ),
    []
  );
  const value = useMemo(
    () => ({
      addMessage,
    }),
    [addMessage]
  );

  return <ToastContext.Provider value={value} {...props} />;
}
