import { BaseDrawer, useDrawer } from "./Drawer";
import { Button, Typography } from "antd";
import { useBreakpoints } from "hooks";
import { useCallback, useEffect } from "react";

const LOCALSTORAGE_KEY = "Dismissed Diligence Warning?";

export function useDiligenceDrawer() {
  const { open } = useDrawer();

  useEffect(() => {
    const hasDismissed =
      window.localStorage.getItem(LOCALSTORAGE_KEY) === "true";

    if (!hasDismissed) {
      open(<DiligenceDrawer />);
    }
  }, [open]);
}

export function DiligenceDrawer() {
  const { close } = useDrawer();
  const handleClose = useCallback(() => {
    close();
    window.localStorage.setItem(LOCALSTORAGE_KEY, "true");
  }, [close]);
  const { isMobile } = useBreakpoints();

  return (
    <BaseDrawer
      title="Disclaimer"
      onClose={handleClose}
      width={isMobile ? "100vw" : 600}
      maskClosable={false}
      maskStyle={{ position: "fixed", top: 0, left: 0, width: "100vw" }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div>
          <Typography.Title level={1}>
            This project is in beta.
          </Typography.Title>
          <Typography.Title level={2}>
            Use it at your own risk.
          </Typography.Title>
          <Button
            type="primary"
            size="large"
            style={{ marginTop: 24 }}
            onClick={handleClose}
          >
            I Understand
          </Button>
        </div>
      </div>
    </BaseDrawer>
  );
}
