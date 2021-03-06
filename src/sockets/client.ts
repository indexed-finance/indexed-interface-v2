import { AppState, actions, selectors, store } from "features";
import { Operation, applyReducer, deepClone } from "fast-json-patch";
import { message } from "antd";

export let socket: null | WebSocket = null;

const timeInSeconds = [1, 1, 3, 5, 8, 13, 21, 99, 999];
let retryAttempts = 0;

export default class SocketClient {
  public static connect() {
    socket = new WebSocket("ws://localhost:13337/");

    socket.onopen = () => {
      message.success("The connection to the server was established.");

      retryAttempts = 0;

      store.dispatch(actions.connectionEstablished());
    };

    socket.onmessage = (message) => {
      const {
        kind,
        data,
      }: {
        kind: "INITIAL_STATE" | "STATE_PATCH";
        data: any;
      } = JSON.parse(message.data);

      switch (kind) {
        case "INITIAL_STATE":
          return store.dispatch(actions.receivedInitialStateFromServer(data));
        case "STATE_PATCH":
          const state = deepClone(store.getState()) as AppState;
          const patch = data as Operation[];

          patch.reduce(applyReducer, state);

          return store.dispatch(actions.receivedStatePatchFromServer(state));
      }
    };

    socket.onerror = async () => {
      if (retryAttempts > 0) {
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const seconds = timeInSeconds[retryAttempts];

        await sleep(seconds * 1000);

        SocketClient.disconnect();
        SocketClient.connect();
      } else {
        const isConnected = selectors.selectConnected(store.getState());

        message.error("Unable to connect to the server. Retrying...");

        if (isConnected) {
          store.dispatch(actions.connectionLost());
        }

        SocketClient.disconnect();
        SocketClient.connect();
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
