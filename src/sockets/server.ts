import { AppState, actions, store } from "features";
import { INFURA_ID, SERVER_POLL_RATE, WEBSOCKET_SERVER_PORT } from "config";
import { providers } from "ethers";
import WebSocket from "isomorphic-ws";
import cloneDeep from "lodash.clonedeep";
import jsonpatch, { Operation } from "fast-json-patch";

const log = (...messages: any[]) =>
  console.info(`Socket Server) `, ...messages);

// #region Store & State
const { dispatch, getState } = store;
const provider = new providers.InfuraProvider("mainnet", INFURA_ID);

/**
 *
 */
const previousState = cloneDeep(store.getState());
let observer = jsonpatch.observe<AppState>(previousState);
let sendingUpdate: NodeJS.Timeout;

const updateClients = () => {
  for (const [key, value] of Object.entries(store.getState())) {
    (previousState as any)[key] = value;
  }

  const patch = jsonpatch.generate(observer);

  if (connections.length > 0 && patch.length > 0) {
    clearTimeout(sendingUpdate);

    sendingUpdate = setTimeout(() => {
      log(`The state has changed -- updating ${connections.length} client(s).`);

      for (const client of connections) {
        client.send(formatStatePatchResponse(patch));
      }

      observer = jsonpatch.observe<AppState>(previousState);
    }, 250);
  }
};
store.subscribe(updateClients);

/**
 *
 */
let updateCount = 0;
const getPoolDetails = () => {
  const state = getState();

  for (const pool of state.indexPools.ids) {
    dispatch(actions.requestPoolDetail(pool as string, false));
  }

  setTimeout(() => {
    updateCount++;
    log(`Polling for updates... (${updateCount})`);
    getPoolDetails();
  }, SERVER_POLL_RATE);
};
/**
 *
 */
const waitThenGetPoolDetails = async () => {
  const state = getState();

  if (state.indexPools.ids.length > 0) {
    unsubscribeFromInitialWait();
    log("Pool IDs loaded.");
    getPoolDetails();
  }
};
const unsubscribeFromInitialWait = store.subscribe(waitThenGetPoolDetails);

(async () => {
  log("Waiting for provider...");

  await provider.ready;

  log("Provider ready. Initializing.");

  dispatch(
    actions.initialize({
      provider,
      withSigner: false,
    })
  );
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
  () => log("Listening...")
);

const connections: WebSocket[] = [];
const clientToIpLookup = new WeakMap<WebSocket, string>();
const ipToClientLookup: Record<string, WebSocket> = {};

wss.on("connection", (client, foo) => {
  const ip = foo.headers.origin ?? "";

  if (!ipToClientLookup[ip]) {
    log("A client has connected.", ip);

    clientToIpLookup.set(client, ip);

    // Prune previous clients with the same IP.
    for (const connection of connections) {
      const connectionIp = clientToIpLookup.get(connection);

      if (connectionIp === ip) {
        connections.splice(connections.indexOf(connection, 1));
      }
    }

    connections.push(client);

    client.send(formatInitialStateResponse(store.getState()));
  }
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
      const droppedIp = clientToIpLookup.get(connection) ?? "";
      connections.splice(connections.indexOf(connection, 1));
      delete ipToClientLookup[droppedIp];

      log("Looks like we lost a connection.", droppedIp);
    }
  }
}, 2000);

// #endregion

// #region Socket Responses
const formatInitialStateResponse = (state: AppState) =>
  JSON.stringify({
    kind: "INITIAL_STATE",
    data: state,
  });

const formatStatePatchResponse = (patch: Operation[]) =>
  JSON.stringify({
    kind: "STATE_PATCH",
    data: patch,
  });
// #endregion
