import { Alert, Button, Typography, notification } from "antd";
import { BaseDrawer, useDrawer } from "../common/Drawer";
import { NETWORKS_BY_ID } from "../../config/network";
import { actions } from "features";
import { useBreakpoints, useTranslator } from "hooks";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useWeb3React } from "@web3-react/core";

export function BadNetworkDrawer() {
  const tx = useTranslator();
  const dispatch = useDispatch();
  const { close } = useDrawer();
  const handleClose = useCallback(() => {
    close();
  }, [close]);
  const { isMobile } = useBreakpoints();
  const { deactivate } = useWeb3React();
  const handleDisconnect = useCallback(() => {
    deactivate();
    dispatch(actions.userDisconnected());

    notification.info({
      message: tx("DISCONNECTED"),
      description: tx("YOU_HAVE_SUCCESSFULLY_DISCONNECTED_YOUR_WALLET"),
    });
  }, [dispatch, deactivate, tx]);

  const goodNetworks = Object.values(NETWORKS_BY_ID).map((n) => n.name);
  let goodNetworksString = goodNetworks[0];
  for (let i = 1; i < goodNetworks.length - 1; i++) {
    goodNetworksString += `, ${goodNetworks[i]}`;
  }
  if (goodNetworks.length > 1) {
    goodNetworksString += ` or ${goodNetworks[goodNetworks.length - 1]}`;
  }

  return (
    <BaseDrawer
      title="Unsupported Network"
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
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <div>
          <Alert
            type="error"
            message={
              <Typography.Title level={1}>Unsupported Network</Typography.Title>
            }
            description={
              <Typography.Title level={2}>
                Please change the network in your wallet settings to{" "}
                {goodNetworksString}.
              </Typography.Title>
            }
          />
          <Button
            type="primary"
            size="large"
            style={{ marginTop: 24 }}
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      </div>
    </BaseDrawer>
  );
}
