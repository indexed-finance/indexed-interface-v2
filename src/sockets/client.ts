import { AppState, actions, selectors, store } from "features";
import { message } from "antd";

export let socket: null | WebSocket = null;

const websocketUrl = "wss://api.indexed.finance/";
const timeInSeconds = [1, 1, 3, 5, 8, 13, 21, 99, 999];
let retryAttempts = 0;

export default class SocketClient {
  public static connect() {
    socket = new WebSocket(websocketUrl);

    socket.onopen = () => {
      message.success("The connection to the server was established.");

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
        // SocketClient.connect();
      } else {
        const isConnected = selectors.selectConnected(store.getState());

        message.error("Unable to connect to the server. Retrying...");

        if (isConnected) {
          store.dispatch(actions.connectionLost());
        }

        SocketClient.disconnect();
        // SocketClient.connect();
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
