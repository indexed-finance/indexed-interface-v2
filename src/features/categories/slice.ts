import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchInitialData } from "../requests";
import { mirroredServerState, restartedDueToError } from "../actions";
import S from "string";
import type { AppState } from "../store";
import type { NormalizedCategory } from "./types";

const adapter = createEntityAdapter<NormalizedCategory>({
  selectId: (entry) => entry.id.toLowerCase(),
});
const initialState = adapter.getInitialState();
const categoriesInitialState = adapter.addMany(initialState, [
  {
    id: "0x1",
    name: "Cryptocurrency",
    symbol: "CC",
    brief:
      "This category tracks Ethereum-based protocol tokens, DeFi governance tokens and wrapped blockchain currencies with a high market cap.",
    description:
      "# Large Cap Cryptocurrency Tokens\nThis category tracks Ethereum-based protocol tokens, DeFi governance tokens and wrapped blockchain currencies with a high market cap.\n\nName: Cryptocurrency\nSymbol: CC\n\n## Criteria\nThis category has the following criteria for inclusion:\n1. The token is at least a week old.\n2. No major vulnerabilities have been discovered in the token contract.\n3. The token's supply can not be arbitrarily inflated or deflated maliciously.\n\t- The control model should be considered if the supply can be modified through governance decisions.\n4. The token does not have transfer fees or other non-standard balance updates.\n5. The token meets the requirements of the [ERC20 standard](https://eips.ethereum.org/EIPS/eip-20).\n\t- Boolean return values are not required.\n6. The token has a fully diluted market cap of at least $50 million.\n7. At least $1 million worth of liquidity is locked in the Uniswap market pair between the token and WETH.\n\t- This does not apply to WETH.\n8. The token is one of:\n\t- Protocol token for an Ethereum-based project.\n\t- Governance token for a DeFi project.\n\t- Wrapper token for a blockchain's native currency.\n\n## Terms\n**Fully Diluted Market Cap:** Market price of one token in USD multiplied by the token's total supply.\n**Protocol Token:** A token used for some core aspect of a system, such as payment for services within a protocol or rewarding users maintaining a network.\n**Governance Token:** A token used to vote on governance decisions for a project.\n**DeFi:** Decentralized Finance - used in reference to Ethereum-based financial projects. By \"financial projects\" we mean projects which directly deal with finance such as exchange, lending, portfolio management, derivatives, etc. and not projects which are only peripherally related to finance.\n\n## Index Naming Scheme\nIndices deployed for this category should use the following naming scheme for the ERC20 name and symbol:\n\n**Symbol:** `CC` + Index Size\n**Name:** `Cryptocurrency Top `  + Index Size + ` Tokens Index`\n\n**Example**\nIndex Size: 5\nSymbol: `CC5`\nName: `Cryptocurrency Top 5 Tokens Index`",
    tokens: {
      ids: [],
      entities: {},
    },
    indexPools: [],
  },
  {
    id: "0x2",
    name: "Decentralized Finance",
    symbol: "DEFI",
    brief: "This category tracks DeFi tokens with a high market cap.",
    description:
      "# Large Cap DeFi Tokens\nThis category tracks DeFi tokens with a high market cap.\n\nName: Decentralized Finance\nSymbol: DEFI\n\n## Criteria\nThis category has the following criteria for inclusion:\n1. The token is at least a week old.\n2. No major vulnerabilities have been discovered in the token contract.\n3. The token's supply can not be arbitrarily inflated or deflated maliciously.\n\t- The control model should be considered if the supply can be modified through governance decisions.\n4. The token does not have transfer fees or other non-standard balance updates.\n5. The token meets the requirements of the [ERC20 standard](https://eips.ethereum.org/EIPS/eip-20).\n\t- Boolean return values are not required.\n6. The token has a fully diluted market cap of at least $50 million.\n7. At least $1 million worth of liquidity is locked in the Uniswap market pair between the token and WETH.\n\t- This does not apply to WETH.\n9. The token is a protocol or governance token for a DeFi project.\n\n## Terms\n**Fully Diluted Market Cap:** Market price of one token in USD multiplied by the token's total supply.\n**Protocol Token:** A token used for some core aspect of a system, such as payment for services within a protocol or rewarding users maintaining a network.\n**Governance Token:** A token used to vote on governance decisions for a project.\n**DeFi:** Decentralized Finance - used in reference to Ethereum-based financial projects. By \"financial projects\" we mean projects which directly deal with finance such as exchange, lending, portfolio management, derivatives, etc. and not projects which are only peripherally related to finance.\n\n## Index Naming Scheme\nIndices deployed for this category should use the following naming scheme for the ERC20 name and symbol:\n\n**Symbol:** `DEFI` + Index Size\n**Name:** `DEFI Top `  + Index Size + ` Tokens Index`\n\n**Example**\nIndex Size: 5\nSymbol: `DEFI5`\nName: `DEFI Top 5 Tokens Index`",
    tokens: {
      ids: [],
      entities: {},
    },
    indexPools: [],
  },
  {
    id: "0x3",
    name: "Oracle",
    symbol: "ORCL",
    brief:
      "This category tracks Ethereum-based protocol and governance tokens for oracle projects.",
    description:
      "# Medium Cap Oracle Tokens\nThis category tracks Ethereum-based protocol and governance tokens for oracle projects.\n\nName: Oracle\nSymbol: ORCL\n\n## Criteria\nThis category has the following criteria for inclusion:\n1. The token is at least 30 days old.\n2. No major vulnerabilities have been discovered in the token contract.\n3. The token's supply can not be arbitrarily inflated or deflated maliciously.\n\t- The control model should be considered if the supply can be modified through governance decisions.\n4. The token does not have transfer fees or other non-standard balance updates.\n5. The token meets the requirements of the [ERC20 standard](https://eips.ethereum.org/EIPS/eip-20).\n\t- Boolean return values are not required.\n6. The token has a fully diluted market cap of at least $40 million.\n7. At least $500k worth of liquidity is held in the Uniswap market pair between the token and WETH.\n8. The token is either a protocol or governance token for an Ethereum-based oracle project.\n\n## Terms\n**Fully Diluted Market Cap:** Market price of one token in USD multiplied by the token's total supply.\n**Protocol Token:** A token used for some core aspect of a system, such as payment for services within a protocol or rewarding users maintaining a network.\n**Governance Token:** A token used to vote on governance decisions for a project.\n**Oracle:** A system used to provide information from off-chain or on-chain components, for use by on-chain smart contracts as feeds or information sources.\n\n## Index Naming Scheme\nIndices deployed for this category should use the following naming scheme for the ERC20 name and symbol:\n\n**Symbol:** `ORCL` + Index Size\n**Name:** `Oracle Top `  + Index Size + ` Tokens Index`\n\n**Example**\nIndex Size: 5\nSymbol: `ORCL5`\nName: `Oracle Top 5 Tokens Index`",
    tokens: {
      ids: [],
      entities: {},
    },
    indexPools: [],
  },
  {
    id: "sigma-v10x1",
    name: "DEGEN Index",
    symbol: "DEGEN",
    brief:
      "This category tracks Ethereum-based protocol tokens, DeFi governance tokens and wrapped blockchain currencies with a high market cap.",
    description:
      "# DEGEN Index (DEGEN)\n\nAs the name implies, the DEGEN Index aims to seek out alpha via higher risk/reward emerging projects with exceptionally high growth potential, predominantly in the DeFi sector. Candidate members have strong communities and large total addressable markets, with circulating market capitalisations ranging from US$50 million to US$2 billion. If any constituent tokens fall out of these bounds, they will be replaced via periodic re-indexing by the largest market cap tokens drawn from a list of alternatives. In this way, the index will constantly evolve to capture upside from tokens during their most rapid growth phases.\n\n## Methodology\n\nThe DEGEN Index weights components according to the square root of their circulating market cap, the data for which is queried from off-chain data sources using an oracle service. DEGEN has a 'candidate' list of eligible tokens, which is filtered on-chain to remove any tokens with market capitalisations outside of the above bounds. The candidate list is sorted once a month in descending order of market capitalisation, and the top 10 eligible assets are selected as the target index constituents. The constituent assets are re-weighted weekly.\n\n## Inclusion Criteria\nThe DEGEN Index has the following criteria for inclusion:\n\n* The token has a market cap ranging from US$50 million to US$2 billion (as calculated by a rolling 14-day TWAP on Uniswap).\n* No major vulnerabilities have been discovered in the token contract.\n* The token’s supply can not be arbitrarily inflated or deflated maliciously.\n    * The control model should be considered if the supply can be modified through governance decisions.\n* The token does not have transfer fees or other non-standard balance updates.\n* The token meets the requirements of the ERC20 standard.\n  * Boolean return values are not required.\n* Sufficient liquidity is locked in the Uniswap market pair between the token and WETH.\n* The token is one of:\n  * Protocol token for an Ethereum-based project.\n  * Governance token for a DeFi project.\n  * Wrapper token for a blockchain’s native currency.",
    tokens: {
      ids: [],
      entities: {},
    },
    indexPools: [],
  },
  {
    id: "sigma-v10x2",
    name: "NFT Index",
    symbol: "NFT",
    brief: "FIXME",
    description: "FIXME",
    tokens: {
      ids: [],
      entities: {},
    },
    indexPools: [],
  },
  {
    id: "sigma-v10x3",
    name: "484 Fund",
    symbol: "ERROR",
    brief: "FIXME",
    description: "FIXME",
    tokens: {
      ids: [],
      entities: {},
    },
    indexPools: [],
  },
  {
    id: "sigma-v10x4",
    name: "Future of Finance Fund",
    symbol: "FFF",
    brief: "FIXME",
    description: "FIXME",
    tokens: {
      ids: [],
      entities: {},
    },
    indexPools: [],
  },
]);

const slice = createSlice({
  name: "categories",
  initialState: categoriesInitialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        if (action.payload) {
          const { categories } = action.payload;
          const mapped = selectors
            .selectAll({ categories: state } as AppState)
            .map((existing) => ({
              ...existing,
              ...categories.entities[existing.id],
            }));

          adapter.upsertMany(state, mapped);
        }
      })
      .addCase(mirroredServerState, (_, action) => action.payload.categories)
      .addCase(restartedDueToError, () => categoriesInitialState),
});

export const { actions: categoriesActions, reducer: categoriesReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.categories);

export const categoriesSelectors = {
  selectCategory: (state: AppState, categoryId: string) =>
    selectors.selectById(state, categoryId),
  selectCategoryLookup: (state: AppState) => selectors.selectEntities(state),
  selectAllCategories: (state: AppState) => selectors.selectAll(state),
  selectCategoryByName: (state: AppState, name: string) => {
    const formatName = (from: string) => S(from).camelize().s.toLowerCase();
    const formattedName = formatName(name);
    const categories = categoriesSelectors
      .selectAllCategories(state)
      .reduce((prev, next) => {
        prev[formatName(next.name)] = next;
        return prev;
      }, {} as Record<string, NormalizedCategory>);

    return categories[formattedName] ?? null;
  },
};
