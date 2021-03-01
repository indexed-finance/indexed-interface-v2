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

export type OhlcvResponse = typeof sampleOhlcvResponse;

const sampleExchangeResponse = {
  type: "exrate",
  asset_id_base: "SNX",
  asset_id_quote: "USD",
  time: "2019-06-11T15:26:00.0000000Z",
  rate: 10065.0319541,
};

export type ExchangeResponse = typeof sampleExchangeResponse;

const sampleReconnectResponse = {
  type: "reconnect",
  within_seconds: 10,
  before_time: "2020-08-06T19:19:09.7035429Z",
};

export type ReconnectResponse = typeof sampleReconnectResponse;
