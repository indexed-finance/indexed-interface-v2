import { AbstractConnector } from "@web3-react/abstract-connector";
import { Avatar, Menu, Space, Typography, notification } from "antd";
import { BaseDrawer } from "./Drawer";
import { OVERLAY_READY, fortmatic } from "connectors";
import { ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { actions } from "features";
import { createDrawerContext, useDrawerControls } from "./Drawer";
import { ethers } from "ethers";
import { useDispatch } from "react-redux";
import { usePrevious, useWalletConnection, useWalletOptions } from "hooks";
import { useTranslation } from "i18n";
import noop from "lodash.noop";

export const WalletConnectionContext = createDrawerContext();

export function useWalletConnectionDrawer() {
  return useContext(WalletConnectionContext);
}

export function WalletConnectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const drawerControls = useDrawerControls();
  const { active, toggle } = drawerControls;
  const { account } = useWeb3React();
  const previousAccount = usePrevious(account);

  useWalletConnection();

  // Effect:
  // [Not connected] -> [Connected]: Close drawer.
  useEffect(() => {
    if (account && !previousAccount && active) {
      toggle();
    }
  }, [account, previousAccount, active, toggle]);

  // Effect:
  // Close drawer if formatic modal is open.
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, toggle);

    return () => {
      fortmatic.off(OVERLAY_READY, toggle);
    };
  }, [toggle]);

  return (
    <WalletConnectionContext.Provider value={drawerControls}>
      {children}

      {active && <WalletConnectionDrawer />}
    </WalletConnectionContext.Provider>
  );
}

export function WalletConnectionDrawer() {
  const { close } = useDrawerControls();
  const tx = useTranslation();
  const dispatch = useDispatch();
  const { account, activate } = useWeb3React();
  const [attemptingActivation, setAttemptingActivation] = useState(false);
  const walletOptions = useWalletOptions();
  const attemptActivation = useCallback(
    async (connector: null | AbstractConnector) => {
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
          })
          .catch((error) => {
            if (error instanceof UnsupportedChainIdError) {
              activate(connector);
            } else {
              notification.error({
                message: tx("ERROR"),
                description: tx("AN_UNKNOWN_ERROR_HAS_OCCURRED_..."),
              });
            }
          })
          .finally(() => setAttemptingActivation(false));
      }
    },
    [dispatch, activate, tx, attemptingActivation, account]
  );

  return (
    <BaseDrawer title={tx("CONNECT_YOUR_WALLET")} onClose={close}>
      <Menu mode="inline">
        {walletOptions.map((option) => (
          <Menu.Item
            key={option.name}
            onClick={() => attemptActivation(option.connector)}
          >
            <Space style={{ justifyContent: "space-between", width: "100%" }}>
              <div style={{ flex: 1 }}>
                <Avatar
                  shape="circle"
                  src={option.icon}
                  style={{ marginRight: 12 }}
                />
                <Typography.Text>{option.name}</Typography.Text>
              </div>
              <Typography.Text
                type="secondary"
                style={{ flex: 1, textAlign: "right" }}
              >
                {option.description}
              </Typography.Text>
            </Space>
          </Menu.Item>
        ))}
      </Menu>
    </BaseDrawer>
  );
}
