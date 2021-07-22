import * as topLevelActions from "./actions";
import { RegisteredCall, abbreviateAddress } from "helpers";
import { TransactionExtra, transactionsActions } from "./transactions";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { batcherActions } from "./batcher";
import { categoriesActions } from "./categories";
import { fetchInitialData } from "./requests";
import { fetchMasterChefData, masterChefActions } from "./masterChef";
import { fetchNewStakingData } from "./newStaking";
import { fetchStakingData, stakingActions } from "./staking";
import { indexPoolsActions } from "./indexPools";
import { notification } from "antd";
import { pairsActions } from "./pairs";
import { providers } from "ethers";
import { settingsActions } from "./settings";
import { tokensActions } from "./tokens";
import { userActions } from "./user";
import type { AppThunk } from "./store";

// #region Provider
type Provider =
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

export const thunks = {
  /**
   *
   */
  initialize:
    (options: InitialzeOptions): AppThunk =>
    async (dispatch) => {
      let selectedAddress = "";

      provider = options.provider;

      if (provider.blockNumber !== -1) {
        dispatch(actions.blockNumberChanged(provider.blockNumber));
      }

      if (options.withSigner) {
        signer = provider.getSigner();

        if (options.selectedAddress) {
          selectedAddress = options.selectedAddress;
        } else if (provider.connection.url === "metamask") {
          selectedAddress = (provider as any).provider.selectedAddress;
        } else {
          throw new Error("Unable to initialize without a selected address.");
        }
      }

      await provider.ready;

      dispatch(
        fetchInitialData({
          provider,
        })
      );
      dispatch(
        fetchStakingData({
          provider,
        })
      );
      dispatch(
        fetchNewStakingData({
          provider,
        })
      );
      dispatch(fetchMasterChefData({ provider }));

      if (selectedAddress) {
        dispatch(actions.userAddressSelected(selectedAddress));
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
  ...stakingActions,
  ...tokensActions,
  ...transactionsActions,
  ...userActions,
  ...topLevelActions,
  ...masterChefActions,
  ...thunks,
};

export type ActionType = typeof actions;

export type DataReceiverConfig = {
  caller: string;
  onChainCalls?: RegisteredCall[];
  offChainCalls?: RegisteredCall[];
};
