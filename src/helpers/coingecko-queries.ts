import CoinGecko from "coingecko-api";

type TokenHistoryResponse = {
  usd: number;
  usd_24h_change: number;
  last_updated_at: number;
};

export const getStatsForTokens = async (tokenAddresses: string[]) => {
  try {
    const client = new CoinGecko();
    const stats = await Promise.all(
      tokenAddresses.map(async (address) => {
        const { data: price } = await client.simple.fetchTokenPrice({
          asset_platform: "ethereum",
          contract_addresses: address,
          include_24hr_change: true,
          include_last_updated_at: true,
          vs_currencies: "usd",
        });

        return price;
      })
    );
    const formattedStats = stats.reduce(
      (prev, next) => {
        for (const [address, information] of Object.entries(next)) {
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
        }

        return prev;
      },
      {} as Record<
        string,
        {
          price: number;
          change24Hours: number;
          change24HoursPercent: number;
          updatedAt: number;
        }
      >
    );

    return formattedStats;
  } catch {}
};
