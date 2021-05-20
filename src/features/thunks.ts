import * as topLevelActions from "./actions";
import { RegisteredCall } from "helpers";
import { SocketClient } from "sockets/client";
import { TransactionExtra, transactionsActions } from "./transactions";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { batcherActions, fetchMulticallData } from "./batcher";
import { categoriesActions } from "./categories";
import {
  fetchIndexPoolTransactions,
  fetchIndexPoolUpdates,
  indexPoolsActions,
} from "./indexPools";
import { fetchInitialData } from "./requests";
import { fetchStakingData, stakingActions } from "./staking";
import { fetchTokenPriceData, tokensActions } from "./tokens";
import { pairsActions } from "./pairs";
import { providers } from "ethers";
import { selectors } from "./selectors";
import { settingsActions } from "./settings";
import { userActions } from "./user";
import debounce from "lodash.debounce";
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

export function useProvider() {
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

/**
 * Since the handler can fire multiple times in quick succession,
 * we need to batch the calls to avoid unnecessary updates.
 */
const BLOCK_HANDLER_DEBOUNCE_RATE = 250;

export const thunks = {
  /**
   *
   */
  initialize:
    (options: InitialzeOptions): AppThunk =>
    async (dispatch, getState) => {
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

      if (selectedAddress) {
        dispatch(actions.userAddressSelected(selectedAddress));
      }

      dispatch(actions.walletConnected());

      SocketClient.disconnect();

      /**
       * When the block number changes,
       * change the state so that batcher may process.
       */
      const debouncedBlockHandler = debounce((blockNumber) => {
        const blockNumberAtThisTime = selectors.selectBlockNumber(getState());

        if (blockNumber !== blockNumberAtThisTime) {
          dispatch(thunks.changeBlockNumber(blockNumber));
        }
      }, BLOCK_HANDLER_DEBOUNCE_RATE);

      provider.addListener("block", debouncedBlockHandler);
    },
  /**
   *
   */
  changeBlockNumber:
    (blockNumber: number): AppThunk =>
    async (dispatch, getState) => {
      const initialBlockNumber = selectors.selectBlockNumber(getState());

      dispatch(actions.blockNumberChanged(blockNumber));

      if (initialBlockNumber !== -1) {
        dispatch(thunks.sendBatch());
      }
    },
  /**
   *
   */
  sendBatch: (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const { status } = selectors.selectBatcherStatus(state);

    if (provider && status === "idle") {
      const batch = selectors.selectBatch(state);

      dispatch(
        fetchMulticallData({
          provider,
          arg: batch,
        })
      );

      for (const call of batch.offChainCalls) {
        const [fn, args] = call.split("/");
        const request = {
          fetchInitialData,
          fetchMulticallData,
          fetchIndexPoolTransactions,
          fetchIndexPoolUpdates,
          fetchTokenPriceData,
        }[fn] as any;

        if (request) {
          dispatch(
            request({
              provider,
              arg: [...args.split("_")],
            })
          );
        }
      }
    }
  },
  addTransaction:
    (
      _tx: TransactionResponse | Promise<TransactionResponse>,
      extra: TransactionExtra = {}
    ): AppThunk =>
    async (dispatch, getState) => {
      const tx = await Promise.resolve(_tx);
      const _provider = provider as Provider;

      dispatch(actions.transactionStarted({ tx, extra }));
      const receipt = await _provider.getTransactionReceipt(tx.hash);
      dispatch(actions.transactionFinalized(receipt));
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
  ...thunks,
};

export type ActionType = typeof actions;

export type DataReceiverConfig = {
  caller: string;
  onChainCalls?: RegisteredCall[];
  offChainCalls?: RegisteredCall[];
};
