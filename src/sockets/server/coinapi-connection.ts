import { COINAPI_API_KEY, COINAPI_SANDBOX_URL } from "config";
import { ExchangeResponse, OhlcvResponse, ReconnectResponse } from "./models";
import { actions, store } from "features";
import { formatPongResponse, log } from "./helpers";
import WebSocket from "isomorphic-ws";

export type PriceData = {
  price: number;
  change24Hours: number;
  percentChange24Hours: number;
  updatedAt: number;
};

let lastSymbols: string[];
let coinapiClient: WebSocket;
let symbolToPriceDataLookup: Record<string, PriceData>;
let prices24HoursAgo: Record<string, null | number>;

export default function setupCoinapiConnection(symbols: string[]) {
  lastSymbols = symbols;

  clearCache();

  coinapiClient = new WebSocket(COINAPI_SANDBOX_URL);

  coinapiClient.on("open", handleOpen);
  coinapiClient.on("ping", handlePing);
  coinapiClient.on("message", handleMessage);
  coinapiClient.on("close", handleClose);
  coinapiClient.on("error", handleError);
}

// #region Helpers
function clearCache() {
  symbolToPriceDataLookup = {};
  prices24HoursAgo = lastSymbols.reduce((prev, next) => {
    prev[next] = null;
    return prev;
  }, {} as Record<string, null | number>);
}

/**
 * After opening the connection, immediately authenticate and specify requested data.
 */
function handleOpen(symbols: string[]) {
  coinapiClient.send(
    JSON.stringify({
      type: "hello",
      apikey: COINAPI_API_KEY,
      heartbeat: false,
      subscribe_data_type: ["ohlcv", "exrate"],
      subscribe_filter_asset_id: symbols,
    })
  );
}

/**
 * @see
 * RFC-6455 [https://www.ietf.org/rfc/rfc6455.txt]
 */
function handlePing() {
  coinapiClient.send(formatPongResponse());
}

function handleMessage(event: WebSocket.MessageEvent) {
  const data = JSON.parse(event.data as string);
  const isUsdLike = (asset: string) => ["USD", "USDC", "USDT"].includes(asset);

  const handlers: Record<string, (data: any) => void> = {
    exrate(_data: ExchangeResponse) {
      try {
        const { asset_id_base: from, asset_id_quote: to, rate } = _data;
        const price24HoursAgo = prices24HoursAgo[from];

        if (isUsdLike(to) && prices24HoursAgo != null) {
          const change24Hours = rate - price24HoursAgo!;
          const percentChange24Hours = change24Hours / rate;

          symbolToPriceDataLookup[from] = {
            price: rate,
            change24Hours,
            percentChange24Hours,
            updatedAt: new Date().getTime(),
          };

          store.dispatch(actions.coingeckoDataLoaded(symbolToPriceDataLookup));
        }
      } catch {}
    },
    ohlcv(_data: OhlcvResponse) {
      try {
        // BINANCE _ SPOT _ <ASSET> _ <OTHER ASSET>
        const [, , asset, otherAsset] = _data.symbol_id.split("_");

        if (isUsdLike(otherAsset)) {
          const oneDay = 24 * 60 * 60 * 1000;
          const twoDays = oneDay * 2;
          const now = new Date().getTime();
          const aDayAgo = now - oneDay;
          const twoDaysAgo = now - twoDays;
          const when = new Date(_data.time_period_end).getTime();

          if (when > twoDaysAgo && when < aDayAgo) {
            prices24HoursAgo[asset] = _data.price_close;
          }
        }
      } catch {}
    },
    reconnect(_data: ReconnectResponse) {
      setupCoinapiConnection(lastSymbols);
    },
  };
  const handler =
    handlers[data.type] ??
    ((_data) => {
      log("No handler present for ", _data.type);
    });

  handler(data);
}

function handleClose() {
  log("CoinAPI connection was terminated.");
}

function handleError(error: WebSocket.ErrorEvent) {
  log("CoinAPI connection was terminated.", error);
}
// #endregion
