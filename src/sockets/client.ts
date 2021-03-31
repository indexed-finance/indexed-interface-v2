import { AppState, actions, selectors, store } from "features";
import { FEATURE_FLAGS } from "feature-flags";
import { message } from "antd";
import { tx } from "i18n";
import noop from "lodash.noop";

export let socket: null | WebSocket = null;

const websocketUrl =
  process.env.NODE_ENV === "production" ||
  FEATURE_FLAGS.useProductionServerLocally
    ? "wss://api.indexed.finance/"
    : "ws://localhost:13337";
const timeInSeconds = [1, 1, 3, 5, 8, 13, 21, 99, 999];
let retryAttempts = 0;

export class SocketClient {
  public static connect(onError: () => void = noop) {
    socket = new WebSocket(websocketUrl);

    socket.onopen = () => {
      message.success(tx("A_CONNECTION_TO_THE_SERVER_WAS_ESTABLISHED"));

      retryAttempts = 0;

      store.dispatch(actions.connectionEstablished());
    };

    socket.onmessage = (message) => {
      const serverState = JSON.parse(message.data) as AppState;

      return store.dispatch(actions.mirroredServerState(serverState));
    };

    socket.onerror = async () => {
      if (retryAttempts > 0) {
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const seconds = timeInSeconds[retryAttempts];

        await sleep(seconds * 1000);

        SocketClient.disconnect();
      } else {
        const isConnected = selectors.selectConnected(store.getState());

        if (isConnected) {
          store.dispatch(actions.connectionLost());
        }

        SocketClient.disconnect();

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

  public static disconnect() {
    socket?.close(1000);
  }
}
