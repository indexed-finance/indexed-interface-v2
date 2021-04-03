import { ReactNode, useCallback } from "react";
import { notification } from "antd";

export type TransactionNotificationConfig = {
  successMessage: ReactNode;
  errorMessage: ReactNode;
};

export function useTransactionNotification({
  successMessage,
  errorMessage,
}: TransactionNotificationConfig) {
  const sendTransaction = useCallback(
    (call: () => Promise<any>) =>
      call()
        .then(() => {
          notification.success({
            message: successMessage,
          });
        })
        .catch(() => {
          notification.error({
            message: errorMessage,
          });

          // Re-throw so parent can handle.
          throw Error();
        }),
    [successMessage, errorMessage]
  );

  return { sendTransaction };
}
