import * as timelocksRequests from "./timelocks/requests";
import * as topLevelActions from "./actions";
import { RegisteredCall, abbreviateAddress } from "helpers";
import { TransactionExtra, transactionsActions } from "./transactions";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { batcherActions } from "./batcher";
import { categoriesActions } from "./categories";
import { fetchInitialData } from "./requests";
import { indexPoolsActions } from "./indexPools";
import { notification } from "antd";
import { pairsActions } from "./pairs";
import { providers } from "ethers";
import { settingsActions } from "./settings";
import { timelocksActions } from "./timelocks";
import { tokensActions } from "./tokens";
import { userActions } from "./user";
import type { AppThunk } from "./store";

// #region Provider
export type Provider =
  | providers.Web3Provider
  | providers.JsonRpcProvider
  | providers.InfuraProvider;

/**
 * A global reference to the provider (always) and signer (for end users) is established
 * and is accessible elsewhere.
 */
export let provider: null | Provider = null;
export let signer: null | providers.JsonRpcSigner = null;

export const disconnectFromProvider = () => {
  provider = null;
  signer = null;
};

export function useProvider(): [
  Provider | null,
  providers.JsonRpcSigner | null
] {
  return [provider, signer];
}

export function useSigner() {
  const [, signer] = useProvider();

  return signer ?? null;
}
// #endregion

type InitialzeOptions = {
  provider:
    | providers.Web3Provider
    | providers.JsonRpcProvider
    | providers.InfuraProvider;
  withSigner?: boolean;
  selectedAddress?: string;
};

const getSigner = (options: InitialzeOptions) => {
  let selectedAddress = "";
  if (options.withSigner) {
    signer = options.provider.getSigner();
    if (options.selectedAddress) {
      selectedAddress = options.selectedAddress;
    } else if (options.provider.connection.url === "metamask") {
      selectedAddress = (provider as any).provider.selectedAddress;
    } else {
      throw new Error("Unable to initialize without a selected address.");
    }
  }
  return selectedAddress;
};

export const thunks = {
  /**
   *
   */
  initialize:
    (options: InitialzeOptions): AppThunk =>
    async (dispatch) => {
      provider = options.provider;
      dispatch(
        fetchInitialData({
          provider,
        })
      );
    },
  setNetwork:
    (options: InitialzeOptions): AppThunk =>
    async (dispatch, getState) => {
      const state = getState();
      provider = options.provider;
      await provider.ready;

      const { chainId } = await provider.getNetwork();
      const lastInit = state.settings.initializedNetworks[chainId] || 0;
      const timeSince = (+new Date() - lastInit) / 1000;
      if (provider.blockNumber !== -1) {
        dispatch(actions.blockNumberChanged(provider.blockNumber));
      }
      dispatch(actions.changedNetwork(chainId));
      if (timeSince > 60) {
        dispatch(actions.initialize(options));
      }

      const selectedAddress = getSigner(options);
      if (selectedAddress) {
        dispatch(actions.userAddressSelected(selectedAddress));
        dispatch(timelocksRequests.fetchUserTimelocks(selectedAddress));
      }

      dispatch(actions.walletConnected());
    },
  addTransaction:
    (
      _tx: TransactionResponse | Promise<TransactionResponse>,
      extra: TransactionExtra = {}
    ): AppThunk =>
    async (dispatch) => {
      const tx = await Promise.resolve(_tx);
      const _provider = provider as Provider;

      dispatch(actions.transactionStarted({ tx, extra }));

      notification.info({
        message: "Transaction sent",
        description: `${abbreviateAddress(tx.hash)} was sent.`,
      });

      const receipt = await _provider.waitForTransaction(tx.hash);

      dispatch(actions.transactionFinalized({ receipt, extra }));
    },
};

export const actions = {
  ...batcherActions,
  ...categoriesActions,
  ...indexPoolsActions,
  ...pairsActions,
  ...settingsActions,
  ...tokensActions,
  ...timelocksActions,
  ...transactionsActions,
  ...userActions,
  ...topLevelActions,
  ...thunks,
};

export type ActionType = typeof actions;

export type DataReceiverConfig = {
  caller: string;
  onChainCalls?: RegisteredCall[];
  offChainCalls?: RegisteredCall[];
};
