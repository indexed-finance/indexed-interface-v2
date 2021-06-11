import { ChainId } from "@indexed-finance/narwhal-sdk";
import { FORTMATIC_KEY } from "config";
import { FortmaticConnector as FortmaticConnectorCore } from "@web3-react/fortmatic-connector";

export const OVERLAY_READY = "OVERLAY_READY";

type FormaticSupportedChains = Extract<
  ChainId,
  ChainId.MAINNET | ChainId.ROPSTEN | ChainId.RINKEBY | ChainId.KOVAN
>;

const CHAIN_ID_NETWORK_ARGUMENT: {
  readonly [chainId in FormaticSupportedChains]: string | undefined;
} = {
  [ChainId.MAINNET]: "mainnet",
  [ChainId.ROPSTEN]: "ropsten",
  [ChainId.RINKEBY]: "rinkeby",
  [ChainId.KOVAN]: "kovan",
};

class FortmaticConnector extends FortmaticConnectorCore {
  async activate() {
    if (!this.fortmatic) {
      const { default: Fortmatic } = await import("fortmatic");

      const { chainId } = this as any;
      if (chainId in CHAIN_ID_NETWORK_ARGUMENT) {
        console.log("key is ", FORTMATIC_KEY);
        this.fortmatic = new Fortmatic(
          FORTMATIC_KEY,
          CHAIN_ID_NETWORK_ARGUMENT[chainId as FormaticSupportedChains]
        );
      } else {
        throw new Error(`Unsupported network ID: ${chainId}`);
      }
    }

    const provider = this.fortmatic.getProvider();

    const pollForOverlayReady = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (provider.overlayReady) {
          clearInterval(interval);
          this.emit(OVERLAY_READY);
          resolve(null);
        }
      }, 200);
    });

    const [account] = await Promise.all([
      provider.enable().then((accounts: string[]) => accounts[0]),
      pollForOverlayReady,
    ]);

    return {
      provider: this.fortmatic.getProvider(),
      chainId: (this as any).chainId,
      account,
    };
  }
}

export const fortmatic = new FortmaticConnector({
  apiKey: FORTMATIC_KEY ?? "",
  chainId: 1,
});
