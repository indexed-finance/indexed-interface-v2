import { IncomingMessage } from "http";
import {
  WEBSOCKET_SERVER_PING_RATE,
  WEBSOCKET_SERVER_PORT,
  WEBSOCKET_SERVER_UPDATE_RATE,
} from "config";
import {
  formatInitialStateResponse,
  formatStatePatchResponse,
  log,
} from "./helpers";
import { store } from "features";
import WebSocket from "isomorphic-ws";
import jsonpatch from "fast-json-patch";

// Set up a collection of client connections.
export const clientToIpLookup = new WeakMap<WebSocket, string>();
export const ipToClientLookup: Record<string, WebSocket> = {};
export const connections: WebSocket[] = [];
export let previousState = store.getState();

/**
 * Creates a WebSocket server that provides quick updates to connected clients.
 */
export default function setupClientHandling() {
  const clientServer: WebSocket.Server = new WebSocket.Server(
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

  clientServer.on("connection", handleConnection);
  clientServer.on("close", handleClose);
  clientServer.on("error", handleError);

  continuouslyCheckForInactivity();
  continuouslySendUpdates();
}

// #region helpers
function handleConnection(client: WebSocket, incoming: IncomingMessage) {
  const ip = incoming.headers.origin ?? "";

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
}

function handleClose(client: WebSocket) {
  log("A client closed their connection.", clientToIpLookup.get(client));
  pruneClient(client);
}

function handleError(client: WebSocket) {
  log("A client experienced an error.", clientToIpLookup.get(client));
  pruneClient(client);
}

function continuouslyCheckForInactivity() {
  setTimeout(async () => {
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
        log(
          "Pruning disconnected connection.",
          clientToIpLookup.get(connection)
        );
        pruneClient(connection);
      }
    }

    continuouslyCheckForInactivity();
  }, WEBSOCKET_SERVER_PING_RATE);
}

function continuouslySendUpdates() {
  setTimeout(() => {
    const currentState = store.getState();
    const differences = jsonpatch.compare(previousState, currentState);

    if (differences.length > 0) {
      for (const client of connections) {
        client.send(formatStatePatchResponse(differences));
      }
    }

    previousState = jsonpatch.deepClone(currentState);

    continuouslySendUpdates();
  }, WEBSOCKET_SERVER_UPDATE_RATE);
}

function pruneClient(client: WebSocket) {
  const droppedIp = clientToIpLookup.get(client) ?? "";
  connections.splice(connections.indexOf(client, 1));
  delete ipToClientLookup[droppedIp];
}
// #endregion
