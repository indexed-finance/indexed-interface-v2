import { AppState, actions, store } from "features";
import { Operation, applyReducer, deepClone } from "fast-json-patch";

export let socket: null | WebSocket = null;

export default class SocketClient {
  public static connect() {
    socket = new WebSocket("ws://localhost:13337/");

    socket.onopen = () => store.dispatch(actions.connectionEstablished());

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

    socket.onerror = socket.onclose = () =>
      store.dispatch(actions.connectionLost());
  }

  public static disconnect() {
    if (socket) {
      socket.close(1000, "Client manually closed the connection.");
    }
  }
}
