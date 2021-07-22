import {
  CLIENT_STATISTICS_REPORTING_RATE,
  WEBSOCKET_SERVER_PING_RATE,
  WEBSOCKET_SERVER_PORT,
} from "config";
import { IncomingMessage } from "http";
import { createServer } from "https";
import { formatMirrorStateResponse, log } from "./helpers";
import { store } from "features";
import WebSocket from "isomorphic-ws";
import fs from "fs";

const DEFLATION_OPTIONS = {
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
};

// Track usage via reporting statistics.
export const clientStatistics = {
  totalConnections: 0,
  totalErrors: 0,
  totalMirrorsSent: 0,
};

// Set up a collection of client connections.
export const clientToIpLookup = new WeakMap<WebSocket, string>();
export const ipToClientLookup: Record<string, WebSocket> = {};
export const connections: WebSocket[] = [];

/**
 * Creates a WebSocket server that provides quick updates to connected clients.
 */
export function setupClientHandling() {
  if (process.env.NODE_ENV === "development") {
    const server = new WebSocket.Server(
      {
        port: WEBSOCKET_SERVER_PORT,
        perMessageDeflate: DEFLATION_OPTIONS,
      },
      () => log("Local socket server listening...")
    );

    server.on("connection", handleConnection);
    server.on("close", handleClose);
    server.on("error", handleError);
  } else {
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
    const wrappedServer = new WebSocket.Server(
      {
        server,
        perMessageDeflate: DEFLATION_OPTIONS,
      },
      () => log("Production socket server listening...")
    );

    wrappedServer.on("connection", handleConnection);
    wrappedServer.on("close", handleClose);
    wrappedServer.on("error", handleError);

    server.listen(443, () => "Server listening on 443...");
  }

  continuouslyCheckForInactivity();
  continuouslyReportStatistics();
}

setInterval(sendUpdates, 5000);

// #region Helpers
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

    clientStatistics.totalMirrorsSent++;
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

let lastBlockNumber = -1;
function sendUpdates() {
  const currentState = store.getState();
  const currentBlockNumber = currentState.batcher.blockNumber;

  if (currentBlockNumber !== lastBlockNumber && connections.length > 0) {
    log(`Updating ${connections.length} clients.`);

    for (const client of connections) {
      client.send(formatMirrorStateResponse(store.getState()));
    }

    clientStatistics.totalMirrorsSent++;
  }

  lastBlockNumber = currentBlockNumber;
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
        if (connection.readyState === connection.OPEN) {
          await ping();
        }
      } catch (error) {
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
  connections.splice(connections.lastIndexOf(client, 1));
  delete ipToClientLookup[droppedIp];
}
// #endregion
