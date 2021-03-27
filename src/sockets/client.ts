import { AppState, actions, selectors, store } from "features";
import { Operation, applyReducer, deepClone } from "fast-json-patch";
import { message } from "antd";

export let socket: null | WebSocket = null;

const websocketUrl =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:13337/"
    : "ws://192.168.1.154:13337/";
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
      const {
        kind,
        data,
      }: {
        kind: "INITIAL_STATE" | "STATE_PATCH";
        data: any;
      } = JSON.parse(message.data);

      switch (kind) {
        case "INITIAL_STATE":
          return store.dispatch(
            actions.receivedInitialStateFromServer({
              ...data,
              batcher: {
                blockNumber: data.batcher.blockNumber,
                onChainCalls: [],
                offChainCalls: [],
                callers: {},
                cache: {},
                listenerCounts: {},
                status: "deferring to server",
              },
            })
          );
        case "STATE_PATCH":
          const state = deepClone(store.getState()) as AppState;
          const patch = data as Operation[];
          const nonBatchPatch = patch.filter(
            (operation) => !operation.path.includes("batcher")
          );

          delete (state as any).batcher;

          nonBatchPatch.reduce(applyReducer, state);

          (state as any).batcher = {
            onChainCalls: [],
            offChainCalls: [],
            callers: {},
            listenerCounts: {},
            status: "deferring to server",
          };

          return store.dispatch(actions.receivedStatePatchFromServer(state));
      }
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
