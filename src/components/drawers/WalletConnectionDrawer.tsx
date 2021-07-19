import { AbstractConnector } from "@web3-react/abstract-connector";
import { BaseDrawer, useDrawer } from "./Drawer";
import { Divider, Space, Typography, notification } from "antd";
import { Fade } from "components/animations";
import { OVERLAY_READY, fortmatic } from "ethereum";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { actions } from "features";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { usePrevious, useTranslator, useWalletOptions } from "hooks";
import noop from "lodash.noop";

export function useWalletConnectionDrawer() {
  const { active, open: baseOpen, close } = useDrawer();
  const { account } = useWeb3React();
  const previousAccount = usePrevious(account);
  const open = useCallback(() => baseOpen(<WalletConnectionDrawer />), [
    baseOpen,
  ]);

  // Effect:
  // [Not connected] -> [Connected]: Close drawer.
  useEffect(() => {
    if (account && !previousAccount && active) {
      close();
    }
  }, [account, previousAccount, active, close]);

  // Effect:
  // Close drawer if formatic modal is open.
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, open);

    return () => {
      fortmatic.off(OVERLAY_READY, close);
    };
  }, [open, close]);

  return {
    open,
  };
}

export function WalletConnectionDrawer() {
  const { close } = useDrawer();
  const tx = useTranslator();
  const dispatch = useDispatch();
  const { account, activate } = useWeb3React();
  const [attemptingActivation, setAttemptingActivation] = useState(false);
  const walletOptions = useWalletOptions();
  const attemptActivation = useCallback(
    async (connector: null | WalletConnectConnector | AbstractConnector) => {
      if (connector && !attemptingActivation) {
        setAttemptingActivation(true);

        if (
          // For WalletConnect, manually reset the connector.
          connector instanceof WalletConnectConnector &&
          connector.walletConnectProvider?.wc?.uri
        ) {
          delete connector.walletConnectProvider;
        }

        activate(connector, noop, true)
          .then(async () => {
            const _account = await connector.getAccount();
            const _provider = await connector.getProvider();
            const provider = new ethers.providers.Web3Provider(_provider, 1);
            const networkId = parseInt(await provider.send("net_version", []));

            if (networkId === 1) {
              dispatch(
                actions.initialize({
                  provider,
                  withSigner: true,
                  selectedAddress: account ?? _account ?? "",
                })
              );

              notification.success({
                message: tx("CONNECTED"),
                description: tx("YOU_HAVE_SUCCESSFULLY_CONNECTED_YOUR_WALLET"),
              });
            } else {
              dispatch(actions.connectedToBadNetwork());
            }
          })
          .catch((error) => {
            if (error instanceof UnsupportedChainIdError) {
              activate(connector);
            } else {
              notification.error({
                message: tx("ERROR"),
                description: tx("AN_UNKNOWN_ERROR_HAS_OCCURRED_..."),
              });

              if (process.env.NODE_ENV === "development") {
                console.error("Unable to connect to wallet", error);
              }
            }
          })
          .finally(() => setAttemptingActivation(false));
      }
    },
    [dispatch, activate, tx, attemptingActivation, account]
  );
  const [fadedOption, setFadedOption] = useState(-1);

  useEffect(() => {
    if (fadedOption < walletOptions.length - 1) {
      setTimeout(() => {
        setFadedOption((prev) => prev + 1);
      }, 200);
    }
  }, [fadedOption, walletOptions]);

  return (
    <BaseDrawer title={tx("CONNECT_YOUR_WALLET")} onClose={close}>
      <Space
        direction="vertical"
        style={{
          width: "100%",
          padding: 24,
        }}
      >
        {walletOptions.map((option, index, array) => (
          <Fade key={option.name} in={fadedOption >= index}>
            <div
              onClick={() => attemptActivation(option.connector)}
              className="wallet-option"
              style={{
                height: 66,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ flex: 1 }}>
                <img
                  src={option.icon}
                  style={{
                    width: 64,
                    height: 64,
                  }}
                  alt={option.name}
                />
              </div>
              <div style={{ textAlign: "right", flex: 2 }}>
                <Typography.Title className="fancy" level={3}>
                  {option.name}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {option.description}
                </Typography.Text>
              </div>
            </div>
            {index !== array.length - 1 && <Divider />}
          </Fade>
        ))}
      </Space>
    </BaseDrawer>
  );
}
