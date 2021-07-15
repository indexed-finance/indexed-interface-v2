import { createAsyncThunk } from "@reduxjs/toolkit";
import CoinGecko from "coingecko-api";

export const fetchTokenPriceData = createAsyncThunk(
  "tokens/fetchPriceData",
  async ({ arg: tokenAddresses }: { arg: string[] }) => {
    try {
      const tokens = await getTokenPriceData(tokenAddresses);
      return tokens;
    } catch (error) {
      return [];
    }
  }
);

// #region Helpers
type TokenHistoryResponse = {
  usd: number;
  usd_24h_change: number;
  last_updated_at: number;
};

export const getTokenPriceData = async (tokenAddresses: string[]) => {
  try {
    const client = new CoinGecko();
    const { data: stats } = await client.simple.fetchTokenPrice({
      asset_platform: "ethereum",
      contract_addresses: tokenAddresses.join(","),
      include_24hr_change: true,
      include_last_updated_at: true,
      vs_currencies: "usd",
    });
    const formattedStats = Object.entries(stats).reduce(
      (prev, [address, information]) => {
        const {
          usd: price,
          usd_24h_change: percentChange24Hours,
          last_updated_at: updatedAt,
        } = information as TokenHistoryResponse;
        const change24Hours = (percentChange24Hours / 100) * price;

        prev[address] = {
          price,
          change24Hours,
          percentChange24Hours,
          updatedAt,
        };

        return prev;
      },
      {} as Record<
        string,
        {
          price: number;
          change24Hours: number;
          percentChange24Hours: number;
          updatedAt: number;
        }
      >
    );

    return formattedStats;
  } catch (error) {
    return {};
  }
};
// #endregion
