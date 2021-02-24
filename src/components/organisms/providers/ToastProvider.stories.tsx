import React, { useContext } from "react";
import ToastProvider, { ToastContext } from "./ToastProvider";

function Inner() {
  const { addMessage } = useContext(ToastContext);

  return (
    <>
      <button
        onClick={() =>
          addMessage({
            content: "Success!",
            level: "success",
          })
        }
      >
        Success
      </button>
      <button
        onClick={() =>
          addMessage({
            content: "Warning!",
            level: "warning",
          })
        }
      >
        Warning
      </button>
      <button
        onClick={() =>
          addMessage({
            content: "Error!",
            level: "error",
          })
        }
      >
        Error
      </button>
    </>
  );
}

export const Basic = () => {
  return (
    <ToastProvider>
      <Inner />
    </ToastProvider>
  );
};

export default {
  title: "Organisms/Providers/ToastProvider",
  component: ToastProvider,
};
