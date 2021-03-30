import { AbstractConnector } from "@web3-react/abstract-connector";
import { Avatar, Drawer, Menu, Space, Typography, notification } from "antd";
import { OVERLAY_READY, fortmatic } from "connectors";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { actions } from "features";
import { ethers } from "ethers";
import { useDispatch } from "react-redux";
import { usePrevious, useWalletConnection, useWalletOptions } from "hooks";
import { useTranslation } from "i18n";
import noop from "lodash.noop";

interface WalletConnectionContext {
  drawerActive: boolean;
  openDrawer(): void;
  closeDrawer(): void;
  toggleDrawer(): void;
}

export const WalletConnectionContext = createContext<WalletConnectionContext>({
  drawerActive: false,
  openDrawer: noop,
  closeDrawer: noop,
  toggleDrawer: noop,
});

export function useWalletConnectionDrawer() {
  return useContext(WalletConnectionContext);
}

export function WalletConnectProvider({ children }: { children: ReactNode }) {
  const { account } = useWeb3React();
  const [
    walletConnectionDrawerActive,
    setWalletConnectionDrawerActive,
  ] = useState(false);
  const previousAccount = usePrevious(account);
  const closeDrawer = useCallback(
    () => setWalletConnectionDrawerActive(false),
    []
  );
  const openDrawer = useCallback(
    () => setWalletConnectionDrawerActive(true),
    []
  );
  const toggleDrawer = useCallback(
    () => setWalletConnectionDrawerActive((prev) => !prev),
    []
  );
  const value = useMemo(
    () => ({
      drawerActive: walletConnectionDrawerActive,
      closeDrawer,
      openDrawer,
      toggleDrawer,
    }),
    [walletConnectionDrawerActive, closeDrawer, openDrawer, toggleDrawer]
  );

  useWalletConnection();

  // Effect:
  // [Not connected] -> [Connected]: Close drawer.
  useEffect(() => {
    if (account && !previousAccount && walletConnectionDrawerActive) {
      toggleDrawer();
    }
  }, [account, previousAccount, walletConnectionDrawerActive, toggleDrawer]);

  // Effect:
  // Close drawer if formatic modal is open.
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, toggleDrawer);

    return () => {
      fortmatic.off(OVERLAY_READY, toggleDrawer);
    };
  }, [toggleDrawer]);

  return (
    <WalletConnectionContext.Provider value={value}>
      {children}

      {walletConnectionDrawerActive && (
        <WalletConnectionDrawer onClose={closeDrawer} />
      )}
    </WalletConnectionContext.Provider>
  );
}

export default function WalletConnectionDrawer({
  onClose,
}: {
  onClose(): void;
}) {
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
    <Drawer
      title={tx("CONNECT_YOUR_WALLET")}
      placement="right"
      closable={false}
      onClose={onClose}
      visible={true}
      mask={false}
      bodyStyle={{ padding: 0 }}
      style={{
        position: "fixed",
        top: 64,
        right: 0,
        zIndex: 30000,
        width: 400,
      }}
    >
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
    </Drawer>
  );
}
