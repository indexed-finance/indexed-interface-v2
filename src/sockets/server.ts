import { AppState, actions, selectors, store } from "features";
import {
  COINAPI_API_KEY,
  COINAPI_SANDBOX_URL,
  INFURA_ID,
  SERVER_DEBOUNCE_RATE,
  SERVER_POLL_RATE,
  WEBSOCKET_SERVER_PORT,
} from "config";
import { providers } from "ethers";
import WebSocket from "isomorphic-ws";
import cloneDeep from "lodash.clonedeep";
import jsonpatch, { Operation } from "fast-json-patch";

const log = (...messages: any[]) =>
  console.info(`Socket Server) `, ...messages);

// #region Store & State
const { dispatch, getState } = store;
const provider = new providers.InfuraProvider("mainnet", INFURA_ID);
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
    }, SERVER_DEBOUNCE_RATE);
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

// Initialize once the provider is ready.
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

// After stabilizing, request symbol information for all relevant tokens.
const retrieveSymbolsAndOpenSocket = async (symbols: string[]) => {
  // Next, open a CoinAPI socket connection and request data for the relevant symbols.
  const coinapiClient = new WebSocket(COINAPI_SANDBOX_URL);

  coinapiClient.onopen = () => {
    const now = new Date().getTime();
    const then = now - 24 * 60 * 60 * 1000; // One day ago.
    const when = new Date(then).toISOString();

    // Authenticate.
    coinapiClient.send(
      JSON.stringify({
        type: "hello",
        apikey: COINAPI_API_KEY,
        heartbeat: false,
        period_id: "1DAY",
        time_period_start: when,
        subscribe_data_type: ["ohlcv"],
        subscribe_filter_asset_id: symbols,
      })
    );
  };

  // RFC-6455 [https://www.ietf.org/rfc/rfc6455.txt]
  coinapiClient.on("ping", () => coinapiClient.send(formatPongResponse()));

  const prices24HoursAgo = symbols.reduce((prev, next) => {
    prev[next] = null;
    return prev;
  }, {} as Record<string, null | number>);

  coinapiClient.onmessage = (event) => {
    const data = JSON.parse(event.data as string);
    const handlers: Record<string, (data: any) => void> = {
      ohlcv: (_data: OhlcvResponse) => {
        try {
          // BINANCE _ SPOT _ <ASSET> _ <OTHER ASSET>
          const [, , asset, otherAsset] = _data.symbol_id.split("_");

          if (
            otherAsset === "USD" ||
            otherAsset === "USDC" ||
            otherAsset === "USDT"
          ) {
            prices24HoursAgo[asset] = _data.price_open;
          }

          dispatch(actions.receivedCoinapiOpenPrices(prices24HoursAgo));
        } catch {}
      },
    };
    const handler =
      handlers[data.type] ??
      ((_data) => {
        log("No handler present for ", _data.type);
      });

    handler(data);
  };

  coinapiClient.onclose = () => log("CoinAPI connection was terminated.");
  coinapiClient.onerror = (error) =>
    log("CoinAPI connection was terminated.", error);
};

const unsubscribeFromWaitingForSymbols = store.subscribe(() => {
  const state = store.getState();
  const symbols = selectors.selectTokenSymbols(state);

  if (symbols.length > 0) {
    unsubscribeFromWaitingForSymbols();
    retrieveSymbolsAndOpenSocket(symbols);
  }
});

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

const formatPongResponse = () =>
  JSON.stringify({
    type: "pong",
  });
// #endregion

// #region Models
const sampleOhlcvResponse = {
  type: "ohlcv",
  symbol_id: "BITSTAMP_SPOT_XRP_USD",
  sequence: 511,
  time_period_start: "2019-06-11T15:26:00.0000000Z",
  time_period_end: "2019-06-11T15:27:00.0000000Z",
  time_open: "2019-06-11T15:26:07.0000000Z",
  time_close: "2019-06-11T15:26:36.0000000Z",
  price_open: 0.3865,
  price_high: 0.38706,
  price_low: 0.3865,
  price_close: 0.38706,
  volume_traded: 1500.31419084,
  trades_count: 5,
};

type OhlcvResponse = typeof sampleOhlcvResponse;
// #endregion
