import { FEATURE_FLAGS } from "feature-flags";
import { Provider, selectors } from "features";
import { SocketClient } from "sockets/client";
import { actions } from "features";
import { ethers } from "ethers";
import { fortmatic, injected, portis, walletConnect } from "ethereum";
import { isMobile } from "react-device-detect";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePrevious } from "./use-previous";
import { useUserAddress } from "./user-hooks";
import { useWeb3React } from "@web3-react/core";
import noop from "lodash.noop";

export type InjectedWindow = typeof window & { ethereum?: any; web3?: any };

export function useInactiveListener(suppress = false) {
  const dispatch = useDispatch();
  const { active, activate, account, chainId, connector } = useWeb3React();
  const prevChainId = usePrevious(chainId);
  const prevActive = usePrevious(active);
  const storeAccount = useUserAddress();
  useEffect(() => {
    // Ignore if triggered by wallet activation
    if (account && active && chainId && chainId !== prevChainId) {
      console.log(`Got changed network in inactive listener useEffect. New network ${chainId}`);
      if (account !== storeAccount || active !== prevActive) {
        console.log(`Caused by wallet connect. Ignoring.`)
      } else {
        console.log(`Not caused by wallet connect. Triggering setNetwork`);
        dispatch(actions.changedNetwork(chainId))
        activate(injected, noop, true).then(async () => {
          if (connector) {
            const _provider = await connector.getProvider();
            const provider = new ethers.providers.Web3Provider(
              _provider,
              "any"
            );
            await provider?.ready;
            dispatch(actions.setNetwork({
              provider: provider as Provider,
              selectedAddress: account ?? "",
              withSigner: true
            }))
          }
        }
        )
      }
    }
    // if (!active && !error && !suppress) {}
  }, [chainId, prevChainId, active, account, storeAccount, dispatch, prevActive, activate, connector])
}

export function useEagerConnect() {
  const dispatch = useDispatch();
  const userAddress = useSelector(selectors.selectUserAddress);
  const { account, activate, active, connector } = useWeb3React();
  const [tried, setTried] = useState(false);
  const handlePostActivate = useCallback(async () => {
    if (connector) {
      const _provider = await connector.getProvider();
      const provider = new ethers.providers.Web3Provider(_provider, "any");
      const networkId = parseInt(await provider.send("net_version", []));
      if (networkId !== undefined) {
        dispatch(
          actions.setNetwork({
            provider,
            withSigner: true,
            selectedAddress: account ?? "",
          })
        );
      } else {
        dispatch(actions.userDisconnected());
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
