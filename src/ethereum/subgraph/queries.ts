import { WETH_CONTRACT_ADDRESS } from "config";
import { computeUniswapPairAddress } from "@indexed-finance/indexed.js/dist/utils/address";

export const pool = `
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

export const initial = `
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
`;

export const singlePool = (address: string) => `
  {
    indexPool(id: "${address}") {
      ${pool}
    }
  }
`;

export const allPools = `
    {
      indexPools (first: 1000) {
        ${pool}
      }
    }
  `;

export const poolUpdate = (address: string) => `
  {
    indexPool(id: "${address}") {
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
  `;

export const trade = (address: string) => `
{
    swaps(orderBy: timestamp, orderDirection: desc, first:10, where:{ pair: "${computeUniswapPairAddress(
      address,
      WETH_CONTRACT_ADDRESS
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
}
`;

export const swap = (address: string) => `
  {
     swaps(orderBy: timestamp, orderDirection: desc, first:10, where: { pool: "${address}" }) {
        id
        tokenIn
        tokenOut
        tokenAmountIn
        tokenAmountOut
        timestamp
      }
  }
`;

export const staking = `
{
  ndxStakingPools(first: 20) {
    id
    isWethPair
    startsAt
		isReady
    indexPool
    stakingToken
    totalSupply
    periodFinish
    lastUpdateTime
    totalRewards
    claimedRewards
    rewardRate
    rewardPerTokenStored
  }
}
`;
