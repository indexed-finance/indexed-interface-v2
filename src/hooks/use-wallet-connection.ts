import { FEATURE_FLAGS } from "feature-flags";
import { SocketClient } from "sockets/client";
import { actions } from "features";
import { ethers } from "ethers";
import { fortmatic, injected, portis, walletConnect } from "ethereum";
import { isMobile } from "react-device-detect";
import { provider, selectors } from "features";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import noop from "lodash.noop";

export type InjectedWindow = typeof window & { ethereum?: any; web3?: any };

export function useInactiveListener(suppress = false) {
  const dispatch = useDispatch();
  const { active, error, activate } = useWeb3React();

  useEffect(() => {
    const { ethereum } = window as InjectedWindow;

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = async () => {
        if (provider) {
          const networkId = parseInt(await provider.send("net_version", []));

          if (networkId === 1) {
            activate(injected, noop, true).catch((error) => {
              console.error("Failed to activate after chain changed", error);
            });
          } else {
            dispatch(actions.connectedToBadNetwork());
          }
        }
      };

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          activate(injected, noop, true).catch((error) => {
            console.error("Failed to activate after accounts changed", error);
          });
        }
      };

      ethereum.on("chainChanged", handleChainChanged);
      ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("chainChanged", handleChainChanged);
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, [active, error, suppress, activate, dispatch]);
}

export function useEagerConnect() {
  const dispatch = useDispatch();
  const userAddress = useSelector(selectors.selectUserAddress);
  const { account, activate, active, connector } = useWeb3React();
  const [tried, setTried] = useState(false);
  const handlePostActivate = useCallback(async () => {
    if (connector) {
      const _provider = await connector.getProvider();
      const provider = new ethers.providers.Web3Provider(_provider, 1);
      const networkId = parseInt(await provider.send("net_version", []));

      if (networkId === 1) {
        dispatch(
          actions.initialize({
            provider,
            withSigner: true,
            selectedAddress: account ?? "",
          })
        );
      } else {
        dispatch(actions.connectedToBadNetwork());
      }
    }
  }, [dispatch, account, connector]);

  // Effect:
  // If the injected provider is already authorized, silently connect for a seamless experience.
  useEffect(() => {
    if (!tried) {
      if (userAddress) {
        injected.isAuthorized().then((isAuthorized) => {
          if (isAuthorized) {
            activate(injected, noop, true)
              .then(handlePostActivate)
              .catch(() => setTried(true));
          } else {
            if (isMobile && (window as InjectedWindow).ethereum) {
              activate(injected, noop, true)
                .then(handlePostActivate)
                .catch(() => setTried(true));
            } else {
              setTried(true);
            }
          }
        });
      }
    }
  }, [activate, handlePostActivate, tried, userAddress]);

  // Effect:
  // Avoid trying multiple times.
  useEffect(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);

  return tried;
}

export function useWalletOptions() {
  const relevantWallets = isMobile
    ? MOBILE_SUPPORTED_WALLETS
    : DESKTOP_SUPPORTED_WALLETS;

  return relevantWallets;
}

export enum SupportedWallet {
  Injected,
  MetaMask,
  WalletConnect,
  CoinbaseWallet,
  Fortmatic,
  Portis,
}

export const SUPPORTED_WALLETS = {
  [SupportedWallet.Injected]: {
    kind: SupportedWallet.Injected,
    connector: injected,
    name: "Injected",
    icon: "",
    description: "Injected web3 provider.",
  },
  [SupportedWallet.MetaMask]: {
    kind: SupportedWallet.MetaMask,
    connector: injected,
    name: "MetaMask",
    icon: "",
    description: "Login using the MetaMask extension.",
  },
  [SupportedWallet.WalletConnect]: {
    kind: SupportedWallet.WalletConnect,
    connector: walletConnect,
    name: "WalletConnect",
    icon: "",
    description: "Login using WalletConnect.",
  },
  [SupportedWallet.CoinbaseWallet]: {
    kind: SupportedWallet.CoinbaseWallet,
    connector: null,
    name: "Open in Coinbase Wallet",
    icon: "",
    description: "Open in the Coinbase Wallet app.",
    link: "https://go.cb-w.com/mtUDhEZPy1",
  },
  [SupportedWallet.Fortmatic]: {
    kind: SupportedWallet.Fortmatic,
    connector: fortmatic,
    name: "Fortmatic",
    icon: "",
    description: "Login using Fortmatic.",
  },
  [SupportedWallet.Portis]: {
    kind: SupportedWallet.Portis,
    connector: portis,
    name: "Portis",
    icon: "",
    description: "Login using Portis.",
  },
};

try {
  SUPPORTED_WALLETS[SupportedWallet.Injected].icon =
    require("images/injected.svg").default;
  SUPPORTED_WALLETS[SupportedWallet.MetaMask].icon =
    require("images/metamask_cyan.png").default;
  SUPPORTED_WALLETS[SupportedWallet.WalletConnect].icon =
    require("images/walletconnect_cyan.png").default;
  SUPPORTED_WALLETS[SupportedWallet.CoinbaseWallet].icon =
    require("images/coinbase_cyan.png").default;
  SUPPORTED_WALLETS[SupportedWallet.Fortmatic].icon =
    require("images/fortmatic_cyan.png").default;
  SUPPORTED_WALLETS[SupportedWallet.Portis].icon =
    require("images/portis_cyan.png").default;
} catch {
  console.info("Unable to import icons; probably because this is the server.");
}

export const MOBILE_SUPPORTED_WALLETS = [
  SupportedWallet.MetaMask,
  SupportedWallet.WalletConnect,
  SupportedWallet.CoinbaseWallet,
].map((kind) => SUPPORTED_WALLETS[kind]);

export const DESKTOP_SUPPORTED_WALLETS = [
  SupportedWallet.MetaMask,
  SupportedWallet.WalletConnect,
  SupportedWallet.Portis,
].map((kind) => SUPPORTED_WALLETS[kind]);

if (FEATURE_FLAGS.useFortmatic) {
  const fortmaticEntry = SUPPORTED_WALLETS[SupportedWallet.Fortmatic];

  MOBILE_SUPPORTED_WALLETS.push(fortmaticEntry);
  DESKTOP_SUPPORTED_WALLETS.push(fortmaticEntry);
}

MOBILE_SUPPORTED_WALLETS.push(SUPPORTED_WALLETS[SupportedWallet.Injected]);
DESKTOP_SUPPORTED_WALLETS.push(SUPPORTED_WALLETS[SupportedWallet.Injected]);

export function useWalletConnection() {
  const walletConnected = useSelector(selectors.selectUserConnected);

  useInactiveListener();
  useEagerConnect();

  useEffect(() => {
    if (!walletConnected) {
      SocketClient.connect({
        onConnect: () => console.log("connected."),
        onError: () => console.log("error"),
      });
    }
  }, [walletConnected]);
}
