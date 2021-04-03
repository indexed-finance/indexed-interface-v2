import {
  CLIENT_STATISTICS_REPORTING_RATE,
  WEBSOCKET_SERVER_PING_RATE,
  WEBSOCKET_SERVER_PORT,
} from "config";
import { IncomingMessage } from "http";
import { createServer } from "https";
import { formatMirrorStateResponse, log } from "./helpers";
import { provider, store } from "features";
import { symbolToPriceDataLookup } from "./coinapi-connection";
import WebSocket from "isomorphic-ws";
import cloneDeep from "lodash.clonedeep";
import fs from "fs";
import jsonpatch from "fast-json-patch";

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
  totalStateOperationsSent: 0,
  totalStatePatchesSent: 0,
};

// Set up a collection of client connections.
export const clientToIpLookup = new WeakMap<WebSocket, string>();
export const ipToClientLookup: Record<string, WebSocket> = {};
export const connections: WebSocket[] = [];
export let previousState = store.getState();
export let previousPriceData = symbolToPriceDataLookup;

/**
 * Creates a WebSocket server that provides quick updates to connected clients.
 */
export function setupClientHandling() {
  if (process.env.NODE_ENV === "development") {
    const socketServer = new WebSocket.Server(
      {
        port: WEBSOCKET_SERVER_PORT,
        perMessageDeflate: DEFLATION_OPTIONS,
      },
      () => log("Local socket server listening...")
    );

    socketServer.on("connection", handleConnection);
    socketServer.on("close", handleClose);
    socketServer.on("error", handleError);
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
    const socketServer = new WebSocket.Server(
      {
        server,
        perMessageDeflate: DEFLATION_OPTIONS,
      },
      () => log("Production socket server listening...")
    );

    socketServer.on("connection", handleConnection);
    socketServer.on("close", handleClose);
    socketServer.on("error", handleError);

    server.listen(443, () => "Server listening...");
  }

  continuouslyCheckForInactivity();
  continuouslyReportStatistics();
}

// #region helpers
let isSendingUpdates = false;

function handleConnection(client: WebSocket, incoming: IncomingMessage) {
  if (
    provider &&
    !isSendingUpdates &&
    provider.listeners("block").length === 0
  ) {
    isSendingUpdates = true;
    provider.addListener("block", sendUpdates);
  }

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

function sendUpdates(blockNumber: number) {
  const currentState = store.getState();
  const differences = jsonpatch.compare(previousState, currentState);

  if (differences.length > 0 && connections.length > 0) {
    setTimeout(() => {
      log(
        `[Block ${blockNumber}]: Updating clients with ${differences.length} patches.`
      );

      for (const client of connections) {
        client.send(formatMirrorStateResponse(currentState));
      }

      clientStatistics.totalStatePatchesSent += differences.length;
      clientStatistics.totalStateOperationsSent++;
    }, 2000); // Give time for the actions to finish. It's fine if they're not all done.
  }

  previousState = jsonpatch.deepClone(currentState);
  previousPriceData = cloneDeep(symbolToPriceDataLookup);
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
        console.error("e", error);

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
