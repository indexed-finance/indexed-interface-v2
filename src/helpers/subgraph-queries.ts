import * as config from "config";
import { computeUniswapPairAddress } from "./uniswap";
import axios from "axios";
import type { Category, IndexPool, NdxStakingPool, Swap } from "indexed-types";
import type { Swap as Trade } from "uniswap-types";

export function getUrl(chainId: number) {
  if (chainId === 1) {
    return config.INDEXED_SUBGRAPH_URL;
  } else {
    return config.INDEXED_RINKEBY_SUBGRAPH_URL;
  }
}

export async function sendQuery(query: string, url: string) {
  const {
    data: { data },
  } = await axios.post(url, {
    query,
  });

  return data;
}

export async function querySinglePool(
  url: string,
  poolAddress: string
): Promise<IndexPool> {
  const { indexPool } = await sendQuery(
    `
  {
    indexPool(id: "${poolAddress}") {
      ${pool}
    }
  }
`,
    url
  );
  return indexPool;
}

export async function queryAllPools(url: string): Promise<IndexPool[]> {
  const { indexPools } = await sendQuery(
    `
  {
    indexPools (first: 1000) {
      ${pool}
    }
  }
`,
    url
  );
  return indexPools;
}

export async function queryPoolUpdate(
  url: string,
  poolAddress: string
): Promise<IndexPool> {
  const { indexPool } = await sendQuery(
    `
  {
    indexPool(id: "${poolAddress}") {
      dailySnapshots(orderBy: date, orderDirection: desc, first: 1) {
        id
        date
        value
        totalSupply
        feesTotalUSD
        totalValueLockedUSD
        totalSwapVolumeUSD
        totalVolumeUSD
      }
      tokens {
        token {
          id
          priceUSD
        }
      }
    }
  }
  `,
    url
  );
  return indexPool;
}

export async function queryInitial(url: string): Promise<Category[]> {
  const { categories } = await sendQuery(
    `
  {
    categories (first: 1000) {
      id
      tokens {
        id
        decimals
        name
        symbol
        priceUSD
      }
      indexPools {
        id
        category {
          id
        }
        size
        name
        symbol
        isPublic
        initialized
        totalSupply
        totalWeight
        maxTotalSupply
        swapFee
        feesTotalUSD
        totalValueLockedUSD
        totalVolumeUSD
        totalSwapVolumeUSD
        tokensList
        poolInitializer {
          id
          totalCreditedWETH
          tokens {
            id
            token {
              id
            }
            balance
            targetBalance
            amountRemaining
          }
        }
        tokens {
          id
          token {
            id
            symbol
          }
          ready
          balance
          minimumBalance
          denorm
          desiredDenorm
        }
        dailySnapshots(orderBy: date, orderDirection: desc, first: 90) {
          id
          date
          value
          totalSupply
          feesTotalUSD
          totalValueLockedUSD
          totalSwapVolumeUSD
          totalVolumeUSD
        }
      }
    }
  }
`,
    url
  );
  return categories;
}

export async function queryTradesForPools(
  url: string,
  poolAddresses: string[]
): Promise<Record<string, Trade[]>> {
  const createSinglePoolCall = (address: string) => `
    ${address.slice(
      1
    )}: swaps(orderBy: timestamp, orderDirection: desc, first:10, where:{ pair: "${computeUniswapPairAddress(
    address,
    config.WETH_CONTRACT_ADDRESS
  ).toLowerCase()}"}) {
      transaction {
        id
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount1In
      amount0Out
      amount1Out
      amountUSD
      timestamp
    }
  `;
  const groupedCalls = `
    {
      ${poolAddresses.map(createSinglePoolCall).join("\n")}
    }
  `;
  const result = await sendQuery(groupedCalls, url);
  const formattedResult = Object.entries(
    result as Record<string, Trade[]>
  ).reduce((prev, [key, value]) => {
    prev[`0${key}`] = value;
    return prev;
  }, {} as Record<string, Trade[]>);

  return formattedResult;
}

export async function querySwapsForPools(
  url: string,
  poolAddresses: string[]
): Promise<Record<string, Swap[]>> {
  const createSinglePoolCall = (address: string) => `
    ${address.slice(
      1
    )}: swaps(orderBy: timestamp, orderDirection: desc, first:10, where: { pool: "${address}" }) {
      id
      tokenIn
      tokenOut
      tokenAmountIn
      tokenAmountOut
      timestamp
    }
  `;
  const groupedCalls = `
    {
      ${poolAddresses.map(createSinglePoolCall).join("\n")}
    }
  `;
  const result = await sendQuery(groupedCalls, url);
  const formattedResult = Object.entries(
    result as Record<string, Swap[]>
  ).reduce((prev, [key, value]) => {
    prev[`0${key}`] = value;
    return prev;
  }, {} as Record<string, Swap[]>);

  return formattedResult;
}

export async function queryStaking(url: string): Promise<NdxStakingPool[]> {
  const { ndxStakingPools: staking } = await sendQuery(
    `
  {
    ndxStakingPools(first: 20) {
      id
      indexPool
      stakingToken
      isWethPair
      startsAt
      periodFinish
      totalSupply
      lastUpdateTime
      totalRewards
      claimedRewards
      rewardRate
      rewardPerTokenStored
    }
  }
  `,
    url
  );
  return staking;
}

// #region Helpers
const pool = `
  id
  category {
    id
  }
  size
  name
  symbol
  isPublic
  initialized
  totalSupply
  totalWeight
  maxTotalSupply
  swapFee
  feesTotalUSD
  totalValueLockedUSD
  totalVolumeUSD
  totalSwapVolumeUSD
  tokensList
  poolInitializer {
    id
    totalCreditedWETH
    tokens {
      token {
        id
        address
        decimals
        name
        symbol
        priceUSD
      }
      balance
      targetBalance
      amountRemaining
    }
  }
  tokens {
    id
    token {
      id
      address
      decimals
      name
      symbol
      priceUSD
    }
    ready
    balance
    denorm
    desiredDenorm
    minimumBalance
  }
  dailySnapshots(orderBy: date, orderDirection: desc, first: 90) {
    id
    date
    value
    totalSupply
    feesTotalUSD
    totalValueLockedUSD
    totalSwapVolumeUSD
    totalVolumeUSD
  }
`;
// #endregion
