import { AppState, actions, selectors, store } from "features";
import { FEATURE_FLAGS } from "feature-flags";
import noop from "lodash.noop";

// export let socket: null | WebSocket = null;

const WEBSOCKET_URL =
  process.env.NODE_ENV === "production" ||
  FEATURE_FLAGS.useProductionServerLocally
    ? "wss://api.indexed.finance/"
    : "ws://localhost:13337";
const FIBONACCI_ROLLOFF = [8, 13, 21, 99, 999];
let retryAttempts = 0;

export type SocketClientConfig = {
  onConnect?(): void;
  onError?(): void;
};

export class SocketClient {
  public static connect({
    onConnect = noop,
    onError = noop,
  }: SocketClientConfig) {
    const socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
      retryAttempts = 0;

      store.dispatch(actions.connectionEstablished());

      onConnect();
    };

    socket.onmessage = (message) => {
      const serverState = JSON.parse(message.data) as AppState;

      return store.dispatch(actions.mirroredServerState(serverState));
    };

    socket.onerror = async () => {
      if (retryAttempts > 0) {
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const seconds = FIBONACCI_ROLLOFF[retryAttempts];

        await sleep(seconds * 1000);
      } else {
        const isConnected = selectors.selectConnected(store.getState());

        if (isConnected) {
          store.dispatch(actions.connectionLost());
        }

        onError();
      }

      retryAttempts++;
    };

    socket.onclose = () => {
      const isConnected = selectors.selectConnected(store.getState());

      if (isConnected) {
        store.dispatch(actions.connectionLost());
      }
    };
  }
}
