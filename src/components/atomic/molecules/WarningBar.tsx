import { Alert, Button, Space } from "antd";
import { ExternalLink } from "../atoms";
import { useEffect, useState } from "react";

const LOCAL_STORAGE_KEY = "WarningBar_01: Dismissed";

export function WarningBar() {
  const [showing, setShowing] = useState(true);

  useEffect(() => {
    const isDismissed = window.localStorage.getItem(LOCAL_STORAGE_KEY);

    if (isDismissed === "true") {
      setShowing(false);
    }
  }, [setShowing]);

  useEffect(() => {
    if (!showing) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, "true");
    }
  }, [showing]);

  return showing ? (
    <Alert
      showIcon={true}
      closable={true}
      style={{ position: "fixed", top: 70, left: 10, zIndex: 10 }}
      type="info"
      onClose={() => setShowing(false)}
      message={
        <Space>
          Indexed 2.0 is finally out, but there may still be some bugs.{" "}
          <ExternalLink to="https://legacy.indexed.finance/">
            Legacy site
          </ExternalLink>
          <Button.Group>
            <a href="mailto://contact@indexed.finance">
              <Button type="default" danger={true} style={{ marginRight: 24 }}>
                Report an issue
              </Button>
            </a>
          </Button.Group>
        </Space>
      }
    />
  ) : null;
}
