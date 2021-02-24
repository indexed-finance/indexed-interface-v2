---
slug: "/docs/sample-page"
title: "Sample Page"
---

# Indexed Finance

Indexed Finance is a project focused on the development of passive portfolio management strategies for the Ethereum network.

Indexed Finance is managed by the holders of its governance token [NDX](https://etherscan.io/token/0x86772b1409b61c639eaac9ba0acfbb6e238e5f83), which is used to vote on proposals for protocol updates and high level index management such as the definition of market sectors and the creation of new management strategies.

## Index Pools

The first product developed by Indexed Finance is a set of capitalization-weighted index pools designed to replicate the behavior of index funds, which historically [have returned better and more consistent returns](https://www.cnbc.com/2019/03/15/active-fund-managers-trail-the-sp-500-for-the-ninth-year-in-a-row-in-triumph-for-indexing.html) than actively managed funds on the stock market.

Index pools simplify asset management on Ethereum the way that index funds do for the stock market: by creating a single asset which represents ownership in a diverse portfolio that tracks the market sector the index represents. Each index pool has an ERC20 index token which anyone can mint by providing the underlying assets in the pool, burn to claim the underlying assets, or swap with exchanges to easily manage their exposure to specific markets.

Index pools regularly rebalance their underlying assets in order to better represent the market sectors they track. Portfolio targets are set using [on-chain data from Uniswap](https://github.com/indexed-finance/uniswap-v2-oracle) and [pre-set rules defined in smart contracts](https://github.com/indexed-finance/indexed-core/blob/eae0eaf9ffc8a0d34a206c056d5e1381a7077f7e/contracts/lib/MCapSqrtLibrary.sol#L56). As with index funds, the only roles for humans in managing index pools are the initial determination of weighting and asset selection rules, the definition of market sectors and the classification of assets into those sectors. These roles are carried out by NDX governance, which has mandatory time-locks for all governance decisions.
