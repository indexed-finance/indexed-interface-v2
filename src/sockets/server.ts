import { AppState, actions, store } from "features";
import { InfuraProvider } from "@ethersproject/providers";
import { QUIKNODE_HTTP_PROVIDER, WEBSOCKET_SERVER_PORT } from "config";
import { ethers } from "ethers";
import WebSocket from "isomorphic-ws";

const log = (...messages: any[]) =>
  console.info(`Socket Server) `, ...messages);

// #region Store & State
const { dispatch, getState } = store;
// const quiknodeBasicProvider = new ethers.providers.JsonRpcProvider(
//   QUIKNODE_HTTP_PROVIDER,
//   1
// );
const quiknodeBasicProvider = new InfuraProvider(
  "mainnet",
  "442bad44b92344b7b5294e4329190fea"
);

(async () => {
  log("Waiting for provider...");

  await quiknodeBasicProvider.ready;

  log("Provider ready. Initializing.");

  dispatch(actions.initialize("", quiknodeBasicProvider));

  const waitThenGetPoolDetails = async () => {
    const state = getState();

    if (state.indexPools.ids.length > 0) {
      unsubscribe();

      log("Pools loaded, getting details.");

      for (const pool of state.indexPools.ids) {
        dispatch(actions.requestPoolDetail(pool as string, false));
      }
    }
  };

  const unsubscribe = store.subscribe(waitThenGetPoolDetails);
})();
// #endregion

// #region Client Handling
const wss: WebSocket.Server = new WebSocket.Server(
  {
    port: WEBSOCKET_SERVER_PORT,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024, // Size (in bytes) below which messages
      // should not be compressed.
    },
  },
  () => console.log("Listening...")
);

const connections: WebSocket[] = [];
const ipLookup = new WeakMap<WebSocket, string>();

wss.on("connection", (client, foo) => {
  const ip = foo.headers.origin ?? "";

  log("A client has connected.", ip);

  ipLookup.set(client, ip);

  connections.push(client);

  client.send(JSON.stringify(formatInitialStateResponse(store.getState())));
});

// Every so often, ensure every client is connected.
setInterval(async () => {
  for (const connection of connections) {
    const ping = (): Promise<any> =>
      new Promise((resolve, reject) =>
        connection.ping(null, false, (err) =>
          err ? reject(err) : resolve(true)
        )
      );

    try {
      await ping();
    } catch {
      log("Looks like we lost a connection.", ipLookup.get(connection));
      connections.splice(connections.indexOf(connection, 1));
    }
  }
}, 2000);

// #endregion

// #region Socket Responses
const formatInitialStateResponse = (state: AppState) => ({
  kind: "INITIAL_STATE",
  data: state,
});

// #endregion
