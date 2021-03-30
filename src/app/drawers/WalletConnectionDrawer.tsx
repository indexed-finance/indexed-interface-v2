import { AbstractConnector } from "@web3-react/abstract-connector";
import { Avatar, Drawer, Menu } from "antd";
import { OVERLAY_READY, fortmatic, injected, portis } from "connectors";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { isMobile } from "react-device-detect";
import { noop } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { usePrevious } from "hooks";
import { useTranslation } from "i18n";

export default function WalletConnectionDrawer() {
  const tx = useTranslation();
  const [drawerActive, setDrawerActive] = useState(true);
  const { account, active, activate, connector, error } = useWeb3React();
  const [attemptingActivation, setAttemptingActivation] = useState(false);
  const previousAccount = usePrevious(account);
  const toggleDrawer = useCallback(() => setDrawerActive((prev) => !prev), []);
  const attemptActivation = useCallback(async () => {
    const { name = "" } =
      Object.values(SUPPORTED_WALLETS).find(
        (value) => connector === value.connector
      ) ?? {};

    setAttemptingActivation(true);

    // For WalletConnect, manually reset the connector.
    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    ) {
      delete connector.walletConnectProvider;
    }

    if (connector) {
      activate(connector, noop, true).catch((error) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector);
        } else {
          // ...
        }
      });
    }
  }, [activate, connector]);

  // Effect:
  // [Not connected] -> [Connected]: Close drawer.
  useEffect(() => {
    if (account && !previousAccount && drawerActive) {
      toggleDrawer();
    }
  }, [account, previousAccount, drawerActive, toggleDrawer]);

  // Effect:
  // Close drawer if formatic modal is open.
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, toggleDrawer);
  }, [toggleDrawer]);
  const options = getWalletOptions();

  return (
    <Drawer
      title={tx("CONNECT_YOUR_WALLET")}
      placement="right"
      closable={false}
      onClose={toggleDrawer}
      visible={drawerActive}
      mask={false}
      bodyStyle={{ padding: 0 }}
      style={{
        position: "fixed",
        top: 64,
        right: 0,
        zIndex: 30000,
      }}
    >
      <Menu mode="inline">
        {options.map((option) => (
          <Menu.Item
            key={option.name}
            onClick={() => {
              /* */
            }}
          >
            <Avatar
              shape="circle"
              src={"https://placehold.it/24x24"}
              style={{ marginRight: 12 }}
            />
            {option.name}
          </Menu.Item>
        ))}
      </Menu>
    </Drawer>
  );
}

// #region Helpers
type InjectedWindow = typeof window & { ethereum?: any; web3?: any };

function getWalletOptions() {
  const { web3, ethereum } = window as InjectedWindow;
  const { isMetaMask = false } = ethereum ?? {};
  const providerExists = Boolean(web3 || ethereum);
  const options = Object.values(SUPPORTED_WALLETS).filter(
    ({ connector, name, mobile: isSupportedOnMobile, mobileOnly }) => {
      if (providerExists) {
        return false;
      } else {
        const isPortis = connector === portis;
        const isInjected = connector === injected;
        const isNamedMetaMask = name === "MetaMask";
        const isNamedInjected = name === "Injected";
        const isMetaMaskMismatch = isNamedMetaMask && !isMetaMask;
        const isInjectedMismatch = isNamedInjected && isMetaMask;
        const isMismatch = isMetaMaskMismatch || isInjectedMismatch;
        const isSupportedOnDesktop = !mobileOnly;
        const isValidDesktopOption =
          (isInjected && isNamedMetaMask) ||
          (!isMobile && isSupportedOnDesktop);
        const isValidMobileOption =
          isMobile && isSupportedOnMobile && !isPortis;

        return !isMismatch && (isValidMobileOption || isValidDesktopOption);
      }
    }
  );

  return options;
}

export interface WalletInfo {
  connector?: AbstractConnector;
  name: string;
  iconName: string;
  description: string;
  href: string | null;
  color: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: "Injected",
    iconName: "arrow-right.svg",
    description: "Injected web3 provider.",
    href: null,
    color: "#010101",
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: "MetaMask",
    iconName: "metamask.png",
    description: "Easy-to-use browser extension.",
    href: null,
    color: "#E8831D",
  },
  COINBASE_LINK: {
    name: "Open in Coinbase Wallet",
    iconName: "coinbaseWalletIcon.svg",
    description: "Open in Coinbase Wallet app.",
    href: "https://go.cb-w.com/mtUDhEZPy1",
    color: "#315CF5",
    mobile: true,
    mobileOnly: true,
  },
  FORTMATIC: {
    connector: fortmatic,
    name: "Fortmatic",
    iconName: "fortmaticIcon.png",
    description: "Login using Fortmatic hosted wallet",
    href: null,
    color: "#6748FF",
    mobile: true,
  },
  Portis: {
    connector: portis,
    name: "Portis",
    iconName: "portisIcon.png",
    description: "Login using Portis hosted wallet",
    href: null,
    color: "#4A6C9B",
    mobile: true,
  },
};
// #endregion
