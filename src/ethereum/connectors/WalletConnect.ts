import { INFURA_ID } from "config";
// import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletConnectConnector } from "libs/@walletconnect-connector";

export const walletConnect = new WalletConnectConnector({
  infuraId: INFURA_ID,
});
