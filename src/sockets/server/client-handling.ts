import {
  CLIENT_STATISTICS_REPORTING_RATE,
  WEBSOCKET_SERVER_PING_RATE,
  WEBSOCKET_SERVER_UPDATE_RATE,
} from "config";
import { IncomingMessage } from "http";
import { createServer } from "https";
import { formatMirrorStateResponse, log } from "./helpers";
import { store } from "features";
import WebSocket from "isomorphic-ws";
import fs from "fs";
import jsonpatch from "fast-json-patch";

// Track usage via reporting statistics.
export const clientStatistics = {
  totalConnections: 0,
  totalErrors: 0,
  totalStateOperationsSent: 0,
  totalStatePatchesSent: 0,
};

// Set up a collection of client connections.
export const clientToIpLookup = new WeakMap<WebSocket, string>();
export const ipToClientLookup: Record<string, WebSocket> = {};
export const connections: WebSocket[] = [];
export let previousState = store.getState();

/**
 * Creates a WebSocket server that provides quick updates to connected clients.
 */
export default function setupClientHandling() {
  const API_CERT_PATH = process.env.API_CERT_PATH;
  const API_KEY_PATH = process.env.API_KEY_PATH;

  if (!(API_CERT_PATH && API_KEY_PATH)) {
    throw new Error(
      "Server requires environment variables API_CERT_PATH and API_KEY_PATH"
    );
  }

  const key = fs.readFileSync(API_KEY_PATH, "utf8");
  const cert = fs.readFileSync(API_CERT_PATH, "utf8");
  const credentials = { key, cert };
  const server = createServer(credentials);
  const socketServer = new WebSocket.Server(
    {
      server,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3,
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024,
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024,
      },
    },
    () => log("Socket server listening...")
  );

  socketServer.on("connection", handleConnection);
  socketServer.on("close", handleClose);
  socketServer.on("error", handleError);

  server.listen(443, () => "Server listening...");

  continuouslyCheckForInactivity();
  continuouslySendUpdates();
  continuouslyReportStatistics();
}

// #region helpers
function handleConnection(client: WebSocket, incoming: IncomingMessage) {
  const ip = incoming.headers.origin ?? "";

  if (!ipToClientLookup[ip]) {
    log("A client has connected.", ip);

    clientStatistics.totalConnections++;

    clientToIpLookup.set(client, ip);

    // Prune previous clients with the same IP.
    for (const connection of connections) {
      const connectionIp = clientToIpLookup.get(connection);

      if (connectionIp === ip) {
        connections.splice(connections.indexOf(connection, 1));
      }
    }

    connections.push(client);

    client.send(formatMirrorStateResponse(store.getState()));
  }
}

function handleClose(client: WebSocket) {
  log("A client closed their connection.", clientToIpLookup.get(client));
  pruneClient(client);
}

function handleError(client: WebSocket) {
  log("A client experienced an error.", clientToIpLookup.get(client));
  pruneClient(client);
  clientStatistics.totalErrors++;
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

    if (differences.length > 0 && connections.length > 0) {
      log(`Updating clients with ${differences.length} patches.`);

      for (const client of connections) {
        client.send(formatMirrorStateResponse(currentState));
      }

      clientStatistics.totalStatePatchesSent += differences.length;
      clientStatistics.totalStateOperationsSent++;
    }

    previousState = jsonpatch.deepClone(currentState);

    continuouslySendUpdates();
  }, WEBSOCKET_SERVER_UPDATE_RATE);
}

function continuouslyReportStatistics() {
  setTimeout(() => {
    log("Client statistics:", {
      currenctConnections: connections.length,
      ...clientStatistics,
    });
    continuouslyReportStatistics();
  }, CLIENT_STATISTICS_REPORTING_RATE);
}

function pruneClient(client: WebSocket) {
  const droppedIp = clientToIpLookup.get(client) ?? "";
  connections.splice(connections.indexOf(client, 1));
  delete ipToClientLookup[droppedIp];
}
// #endregion
