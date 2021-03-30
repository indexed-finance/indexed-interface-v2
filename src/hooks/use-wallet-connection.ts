import { actions } from "features";
import { ethers } from "ethers";
import { fortmatic, injected, portis } from "connectors";
import { isMobile } from "react-device-detect";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import coinbaseWalletIcon from "assets/images/connectors/coinbase.svg";
import flags from "feature-flags";
import fortmaticIcon from "assets/images/connectors/fortmatic.png";
import injectedIcon from "assets/images/connectors/injected.svg";
import metamaskIcon from "assets/images/connectors/metamask.png";
import noop from "lodash.noop";
import portisIcon from "assets/images/connectors/portis.png";

export type InjectedWindow = typeof window & { ethereum?: any; web3?: any };

export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React();

  useEffect(() => {
    const { ethereum } = window as InjectedWindow;

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        activate(injected, noop, true).catch((error) => {
          console.error("Failed to activate after chain changed", error);
        });
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
  }, [active, error, suppress, activate]);
}

export function useEagerConnect() {
  const dispatch = useDispatch();
  const { account, activate, active, connector } = useWeb3React();
  const [tried, setTried] = useState(false);
  const handlePostActivate = useCallback(async () => {
    if (connector) {
      const _provider = await connector.getProvider();
      const provider = new ethers.providers.Web3Provider(_provider, 1);

      dispatch(
        actions.initialize({
          provider,
          withSigner: true,
          selectedAddress: account ?? "",
        })
      );
    }
  }, [dispatch, account, connector]);

  // Effect:
  // If the injected provider is already authorized, silently connect for a seamless experience.
  useEffect(() => {
    if (!tried) {
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
  }, [activate, handlePostActivate, tried]);

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
  const { ethereum } = window as InjectedWindow;
  const { isMetaMask = false } = ethereum ?? {};
  const relevantWallets = isMobile
    ? MOBILE_SUPPORTED_WALLETS
    : DESKTOP_SUPPORTED_WALLETS;
  const options = useMemo(
    () =>
      relevantWallets.filter(({ name }) => {
        const isMetaMaskMismatch = name === "MetaMask" && !isMetaMask;
        const isInjectedMismatch = name === "Injected" && isMetaMask;

        return !(isMetaMaskMismatch || isInjectedMismatch);
      }),
    [isMetaMask, relevantWallets]
  );

  return options;
}

export enum SupportedWallet {
  Injected,
  MetaMask,
  CoinbaseWallet,
  Fortmatic,
  Portis,
}

export const SUPPORTED_WALLETS = {
  [SupportedWallet.Injected]: {
    kind: SupportedWallet.Injected,
    connector: injected,
    name: "Injected",
    icon: injectedIcon,
    description: "Injected web3 provider.",
  },
  [SupportedWallet.MetaMask]: {
    kind: SupportedWallet.MetaMask,
    connector: injected,
    name: "MetaMask",
    icon: metamaskIcon,
    description: "Easy-to-use browser extension.",
  },
  [SupportedWallet.CoinbaseWallet]: {
    kind: SupportedWallet.CoinbaseWallet,
    connector: null,
    name: "Open in Coinbase Wallet",
    icon: coinbaseWalletIcon,
    description: "Open in Coinbase Wallet app.",
    link: "https://go.cb-w.com/mtUDhEZPy1",
  },
  [SupportedWallet.Fortmatic]: {
    kind: SupportedWallet.Fortmatic,
    connector: fortmatic,
    name: "Fortmatic",
    icon: fortmaticIcon,
    description: "Login using Fortmatic hosted wallet.",
  },
  [SupportedWallet.Portis]: {
    kind: SupportedWallet.Portis,
    connector: portis,
    name: "Portis",
    icon: portisIcon,
    description: "Login using Portis hosted wallet.",
  },
};

export const MOBILE_SUPPORTED_WALLETS = [SupportedWallet.CoinbaseWallet].map(
  (kind) => SUPPORTED_WALLETS[kind]
);

export const DESKTOP_SUPPORTED_WALLETS = [
  SupportedWallet.Injected,
  SupportedWallet.MetaMask,
  SupportedWallet.Portis,
].map((kind) => SUPPORTED_WALLETS[kind]);

if (flags.useFortmatic) {
  const fortmaticEntry = SUPPORTED_WALLETS[SupportedWallet.Fortmatic];

  MOBILE_SUPPORTED_WALLETS.push(fortmaticEntry);
  DESKTOP_SUPPORTED_WALLETS.push(fortmaticEntry);
}

export default function useWalletConnection() {
  useInactiveListener();
  useEagerConnect();
}
