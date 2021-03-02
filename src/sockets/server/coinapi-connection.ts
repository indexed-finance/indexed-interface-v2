import {
  COINAPI_API_KEY,
  COINAPI_SANDBOX_URL,
  COINAPI_USAGE_REPORT_RATE,
} from "config";
import { ExchangeResponse, OhlcvResponse } from "./models";
import { actions, store } from "features";
import { formatPongResponse, log } from "./helpers";
import WebSocket from "isomorphic-ws";

export type PriceData = {
  price: number;
  change24Hours: number;
  percentChange24Hours: number;
  updatedAt: number;
};

export const coinapiUsage = {
  pingCount: 0,
  messageCount: 0,
  errorCount: 0,
  restartCount: 0,
  responseCounts: {
    ohlcv: 0,
    exrate: 0,
    unexpected: 0,
  },
};

export let lastSymbols: string[];
export let coinapiClient: WebSocket;
export let symbolToPriceDataLookup: Record<string, PriceData>;
export let prices24HoursAgo: Record<string, null | number>;

export default function setupCoinapiConnection(symbols: string[]) {
  lastSymbols = symbols;

  clearCache();

  coinapiClient = new WebSocket(COINAPI_SANDBOX_URL);

  coinapiClient.on("open", handleOpen);
  coinapiClient.on("ping", handlePing);
  coinapiClient.on("message", handleMessage);
  coinapiClient.on("close", handleClose);
  coinapiClient.on("error", handleError);

  continuouslyReportCoinapiUsage();
}

// #region Helpers
/**
 *
 */
function clearCache() {
  symbolToPriceDataLookup = {};
  prices24HoursAgo = lastSymbols.reduce((prev, next) => {
    prev[next] = null;
    return prev;
  }, {} as Record<string, null | number>);
}
/**
 *
 * @param asset -
 */
function isUsdLike(asset: string) {
  return ["USD", "USDC", "USDT"].includes(asset);
}
/**
 * After opening the connection, immediately authenticate and specify requested data.
 */
function handleOpen(symbols: string[]) {
  log("Opened connection to CoinAPI.");

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
  log("Received ping from CoinAPI.");

  coinapiClient.send(formatPongResponse());

  coinapiUsage.pingCount++;
}
/**
 *
 * @param event -
 */
function handleMessage(event: string) {
  const data = JSON.parse(event);
  const handlers: Record<string, (data: any) => void> = {
    ping: handlePing,
    exrate: handleExrateResponse,
    ohlcv: handleOhlcvResponse,
    reconnect: () => {
      setupCoinapiConnection(lastSymbols);
      coinapiUsage.restartCount++;
    },
  };
  const handler = handlers[data.type] ?? handleUnexpectedResponse;

  handler(data);

  coinapiUsage.messageCount++;
}
/**
 *
 */
function handleClose() {
  log("CoinAPI connection was terminated.");
}
/**
 *
 * @param error -
 */
function handleError(error: WebSocket.ErrorEvent) {
  log("CoinAPI connection was terminated.", error);

  coinapiUsage.errorCount++;
}
/**
 *
 * @param data -
 */
function handleExrateResponse(data: ExchangeResponse) {
  try {
    const { asset_id_base: from, asset_id_quote: to, rate } = data;
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
  } finally {
    coinapiUsage.responseCounts.exrate++;
  }
}
/**
 *
 * @param data -
 */
function handleOhlcvResponse(data: OhlcvResponse) {
  try {
    // BINANCE _ SPOT _ <ASSET> _ <OTHER ASSET>
    const [, , asset, otherAsset] = data.symbol_id.split("_");

    if (isUsdLike(otherAsset)) {
      const oneDay = 24 * 60 * 60 * 1000;
      const twoDays = oneDay * 2;
      const now = new Date().getTime();
      const aDayAgo = now - oneDay;
      const twoDaysAgo = now - twoDays;
      const when = new Date(data.time_period_end).getTime();

      if (when > twoDaysAgo && when < aDayAgo) {
        prices24HoursAgo[asset] = data.price_close;
      }
    }
  } finally {
    coinapiUsage.responseCounts.ohlcv++;
  }
}
/**
 *
 * @param data -
 */
function handleUnexpectedResponse(data: { type: string }) {
  log("Unexpected response; no handler present for ", data.type);

  coinapiUsage.responseCounts.unexpected++;
}
/**
 *
 */
function continuouslyReportCoinapiUsage() {
  setTimeout(() => {
    log("CoinAPI usage:", coinapiUsage);
    continuouslyReportCoinapiUsage();
  }, COINAPI_USAGE_REPORT_RATE);
}
// #endregion
