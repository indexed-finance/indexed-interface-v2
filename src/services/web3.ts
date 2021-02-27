import { DEFAULT_TOKEN, ERRORS, NETWORKS } from "config";
import {
  PoolHelper,
  StakingPoolHelper,
  getAllHelpers,
  getStakingHelpers,
} from "@indexed-finance/indexed.js";
import { ReactNode } from "react";
import { getAddress } from "ethers/lib/utils";
// import Fortmatic from "fortmatic";
import GraphqlService from "./graphql";
// import Torus from "@toruslabs/torus-embed";
// import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import Web3Modal from "web3modal";
import noop from "lodash.noop";
import settings from "settings.json";

const PROVIDER_OPTIONS = {
  // walletconnect: {
  //   package: WalletConnectProvider,
  //   options: {
  //     infuraId: "442bad44b92344b7b5294e4329190fea",
  //   },
  // },
  // fortmatic: {
  //   package: Fortmatic,
  //   options: {
  //     key: "pk_test_F0261A757AD16AD0",
  //   },
  // },
  // torus: {
  //   package: Torus,
  //   options: {
  //     networkParams: {
  //       chainId: 1,
  //       networkId: 1,
  //     },
  //   },
  // },
};

export interface CategoryToken {
  id: string;
  name: string;
  symbol: string;
  priceUSD: string;
}

export interface Category {
  id: string;
  description: string;
  brief: string;
  name: string;
  symbol: string;
  indexPools: string[];
  tokens: CategoryToken[];
}

export interface FullCategory extends Omit<Category, "indexPools"> {
  indexPools: IndexPool[];
}

export interface IndexPool {
  name: string;
  symbol: string;
  chainId: number;
  lastUpdate: number;
  size: number;
  maxTotalSupply: string; // From BN
  isPublic: boolean;
  category: string;
  addresses: {
    primary: string;
    initializer: string;
    index: string;
  };
  fees: {
    swap: string; // From BN
    totalUsd: string;
  };
  totals: {
    supply: string; // From BN
    swapVolumeUsd: string;
    valueLockedUsd: string;
    volumeUsd: string; // From BN
    weight: string; // From BN
  };
  tokens: string[];
}

export interface FullIndexPool extends Omit<IndexPool, "tokens"> {
  tokens: Token[];
}

type Kind = "buy" | "sell";

interface BaseTransaction {
  input: string;
  output: string;
  time: string;
  transaction: string;
  title?: ReactNode;
}

export interface Trade extends BaseTransaction {
  kind: Kind;
}

export type Swap = BaseTransaction;

export interface CombinedPool extends FullIndexPool {
  swaps: Swap[];
  trades: Trade[];
}

export interface Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  priceUsd: number;
  ready: boolean;
  current: {
    balance: string; // From BN
    denorm: string; // From BN
    weight: string; // From BN
  };
  desired: {
    denorm: string; // From BN
    weight: string; // From BN
  };
  used: {
    balance: string; // From BN
    denorm: string; // From BN
    weight: string; // From BN
  };
}

export type AppData = {
  categories: Category[];
  indexPools: IndexPool[];
  tokens: Token[];
};

/**
 * A service that handles utilizing a Web3 connection to retrieve:
 *  - Pools
 *  - Pool Helpers
 *  - Pool Metadata
 *  - Categories
 *  - Tokens
 *
 * @remarks
 * Web3Service exposes an instance static member that acts as a singleton.
 */
export default class Web3Service {
  public static instance = new Web3Service();

  public provider: null | Web3 = null;
  public account = "";
  public network = 0;
  public pools: StakingPoolHelper[] = [];
  public helpers: null | {
    initialized: PoolHelper[];
  } = null;
  public metadataLookup: PoolMetadataLookup = {};
  public categoryLookup: PoolCategoryLookup = {};
  public tokens: string[] = [];

  private activePoolIndex = -1;
  private requestInFlight = false;
  private calculators: Record<string, Record<string, any>> = {};

  public get activePool(): StakingPoolHelper | null {
    return this.pools[this.activePoolIndex] || null;
  }

  public get activeHelper(): PoolHelper | null {
    return (
      this.helpers?.initialized.find((helper) => {
        return helper.pool.address === this.account;
      }) || null
    );
  }

  /**
   * Utilizes a modal to prompt the user to connect to a Web3 source.
   * Once connects, it will proceed to fetch pools, helpers, categories, metadata and tokens
   * in the proper order.
   *
   * @remarks
   * - Through a decorator, the Web3Service is bound to the store state and updates relevant properties automatically.
   *
   * @returns Promise<void>
   */
  public connect = async (): Promise<void> => {
    try {
      const web3Modal = new Web3Modal({
        network: NETWORKS.mainnet.name,
        cacheProvider: true,
        providerOptions: PROVIDER_OPTIONS,
      });

      web3Modal.clearCachedProvider();

      const provider = await web3Modal.connect();

      // What is this?
      if (provider.wc) {
        (window as any).send = (x: any, y: any) => provider.send(x, y);
      }

      this.provider = new Web3(provider);

      return this.fetchAccounts()
        .then(this.fetchPools)
        .then(this.fetchHelpers)
        .then(this.fetchCategories)
        .then(this.fetchMetadata)
        .then(this.fetchTokens);
    } catch (error) {
      console.error(error);

      this.provider = null;
    }
  };

  /**
   * Resets public properties back to their defaults.
   *
   * @returns void
   */
  public disconnect = (): void => {
    // TODO: Clear cache.

    this.provider = null;
    this.account = "";
    this.network = 0;
    this.helpers = null;
    this.metadataLookup = {};
    this.pools = [];
    this.tokens = [];
    this.requestInFlight = false;
  };

  /**
   *
   */
  public getRelevantData = (): AppData => {
    const normalizedPools = this.getNormalizedPoolData();
    const indexPools: IndexPool[] = normalizedPools
      .map((pool) => {
        return {
          name: pool.index.name,
          symbol: pool.index.symbol,
          category: this.categoryLookup[`0x${pool.category}`].symbol,
          tokens: pool.tokens.map((token) => token.symbol),
          addresses: pool.addresses,
          chainId: pool.chainId,
          isPublic: pool.isPublic,
          fees: pool.fees,
          totals: pool.totals,
          maxTotalSupply: pool.maxTotalSupply,
          size: pool.size,
          lastUpdate: pool.lastUpdate,
        };
      })
      .reduce((prev, next) => {
        console.log("<pools>", prev, next);

        if (!prev.some((entry) => entry.name === next.name)) {
          prev.push(next);
        }

        return prev;
      }, [] as IndexPool[]);
    const categorySymbolToIndexLookup = indexPools.reduce((prev, next) => {
      if (!prev[next.category]) {
        prev[next.category] = [];
      }

      prev[next.category].push(next.symbol);

      return prev;
    }, {} as Record<string, string[]>);
    const categories = Object.entries(this.categoryLookup).reduce(
      (prev, [key, value]) => {
        prev.push({
          id: key,
          indexPools: categorySymbolToIndexLookup[value.symbol],
          ...value,
        });

        return prev;
      },
      [] as Category[]
    );
    const tokens = normalizedPools
      .map((pool) => pool.tokens)
      .reduce((prev, next) => {
        prev = prev.concat(next);
        return prev;
      }, [])
      .reduce((prev, next) => {
        console.log("<tokens>", prev, next);

        if (!prev.some((entry) => entry.name === next.name)) {
          prev.push(next);
        }

        return prev;
      }, [] as Token[]);

    return {
      categories,
      indexPools,
      tokens,
    };
  };

  /**
   * Formats all relevant instance properties into a common data structure
   * for external consumption.
   *
   * @throws noRelevantHelper
   * @returns NormalizedPool[]
   */
  public getNormalizedPoolData = () => {
    const helperLookup = (this.helpers?.initialized || []).reduce(
      (prev, next) => {
        prev[next.pool.address] = next;
        return prev;
      },
      {} as Record<string, PoolHelper>
    );

    return this.pools.map((pool) => {
      const poolHelper = helperLookup[pool.pool.indexPool];

      if (!poolHelper) {
        throw new Error(ERRORS.Web3Service.noRelevantHelper);
      }

      return {
        chainId: pool.chainID,
        lastUpdate: poolHelper.lastUpdate,
        size: poolHelper.pool.size,
        maxTotalSupply: poolHelper.pool.maxTotalSupply.toString(),
        isPublic: poolHelper.pool.isPublic,
        addresses: {
          primary: pool.pool.address,
          initializer: poolHelper.initializer,
          index: pool.pool.indexPool,
        },
        index: {
          symbol: poolHelper.pool.symbol,
          name: poolHelper.pool.name,
        },
        category: poolHelper.pool.category,
        fees: {
          swap: poolHelper.pool.swapFee.toString(),
          totalUsd: poolHelper.pool.feesTotalUSD,
        },
        totals: {
          supply: poolHelper.pool.totalSupply.toString(),
          swapVolumeUsd: poolHelper.pool.totalSwapVolumeUSD.toString(),
          valueLockedUsd: poolHelper.pool.totalValueLockedUSD.toString(),
          volumeUsd: poolHelper.pool.totalSwapVolumeUSD.toString(), // Missing property `totalVolumeUsd?`
          weight: poolHelper.pool.totalWeight.toString(),
        },
        tokens: poolHelper.pool.tokens.map((token) => ({
          name: token.name,
          symbol: token.symbol,
          address: token.address,
          decimals: token.decimals,
          priceUsd: token.priceUSD,
          ready: token.ready,
          current: {
            balance: token.balance.toString(),
            denorm: token.denorm.toString(),
            weight: token.weight.toString(),
          },
          desired: {
            denorm: token.desiredDenorm.toString(),
            weight: token.desiredWeight.toString(),
          },
          used: {
            balance: token.usedBalance.toString(),
            denorm: token.usedDenorm.toString(),
            weight: token.usedWeight.toString(),
          },
        })),
      };
    });
  };

  /**
   * Returns pool-specific calculators for a given pool.
   *
   * @param address - string
   */
  public getCalculatorsFor(address: string) {
    return this.calculators[address];
  }

  /**
   * Asynchronously retrieve the user's selected address and network
   * Sets property `this.network`
   * Sets property `this.accounts`
   *
   * @remarks
   * - The expected network varies depending on whether the connection is to mainnet or rinkeby.
   *
   * @throws badNetwork
   * @throws fetchAccountsPriorToConnect
   * @returns Promise<void>
   */
  private fetchAccounts = async () => {
    if (this.provider) {
      const [primaryAccount] = await this.provider.eth.getAccounts();
      // const expectedNetwork =
      //   process.env.REACT_APP_ETH_NETWORK === NETWORKS.mainnet.name
      //     ? NETWORKS.mainnet.id
      //     : NETWORKS.rinkeby.id;
      const expectedNetwork = NETWORKS.mainnet.id;

      this.network = await this.provider.eth.net.getId();
      this.account = getAddress(primaryAccount);

      if (this.network !== expectedNetwork) {
        this.disconnectWithError(ERRORS.Web3Service.badNetwork);
      }
    } else {
      this.disconnectWithError(ERRORS.Web3Service.fetchAccountsPriorToConnect);
    }
  };

  /**
   * Asynchronously retrieves pools and sets the user address on them.
   * Sets property `this.activePoolIndex`
   * Sets property `this.pools`
   *
   * @throws fetchPoolsPriorToConnect
   * @returns Promise<void>
   */
  private fetchPools = async () => {
    if (this.provider) {
      const pools = await getStakingHelpers(this.provider, this.account);

      if (pools.length > 0) {
        this.activePoolIndex = 1;
      }

      for (const pool of pools) {
        pool.setUserAddress(this.account);
      }

      this.pools = pools;
    } else {
      this.disconnectWithError(ERRORS.Web3Service.fetchPoolsPriorToConnect);
    }
  };

  /**
   * Asynchronously retrieves pool helpers based on the selected provider and account.
   * Sets property `this.helpers`
   *
   * @throws fetchTokensPriorToConnect
   * @returns Promise<void>
   */
  private fetchHelpers = async () => {
    if (this.provider) {
      const helpers = await getAllHelpers(this.provider, this.account);

      this.helpers = helpers;

      // Update calculator lookup.
      const tokenToIndexPoolLookup = this.pools.reduce((prev, next) => {
        prev[next.pool.address] = next.pool.indexPool;
        return prev;
      }, {} as Record<string, string>);
      const calculators = this.pools.reduce((prev, next) => {
        const { address } = next.pool;
        const indexAddress = tokenToIndexPoolLookup[address];

        prev[address] = {
          inputToOutput: noop,
          outputToInput: noop,
        };

        if (this.helpers) {
          const helper = this.helpers.initialized.find(
            ({ pool }) => pool.address === indexAddress
          );

          if (helper) {
            prev[address] = {
              inputToOutput: helper.calcOutGivenIn.bind(helper),
              outputToInput: helper.calcInGivenOut.bind(helper),
            };
          }
        }

        return prev;
      }, {} as Record<string, Record<string, any>>);

      this.calculators = calculators;
    } else {
      this.disconnectWithError(ERRORS.Web3Service.fetchTokensPriorToConnect);
    }
  };

  /**
   * Asynchronously retrieves index categories based on the selected network and relevant pool helpers.
   * Sets property `this.requestInFlight`
   * Sets property `this.categories`
   *
   * @example
   * Cryptocurrency [CC]
   * Decentralized Finance [DEFI]
   *
   * @remarks
   * - Is prevented from being fired multiple times.
   *
   * @throws fetchTokensPriorToConnect
   * @returns Promise<void>
   */
  private fetchCategories = async () => {
    if (!this.requestInFlight) {
      this.requestInFlight = true;

      if (this.helpers) {
        // TODO: Lol, no.
        if (Boolean("true")) {
          const tokenCategories = await GraphqlService.getTokenCategories();
          const tokenCategoryLookup = tokenCategories.reduce((prev, next) => {
            prev[next.id] = next.tokens;
            return prev;
          }, {} as Record<string, PoolCategoryToken[]>);

          this.categoryLookup = this.helpers.initialized.reduce(
            (prev, next) => {
              console.log("prev", prev);
              console.log("next", next);

              const id = formatCategoryIdWithPrefix(next.category);
              const which = (settings.categories as Record<
                string,
                Omit<PoolCategory, "tokens">
              >)[id];
              const { name, symbol, description, brief } = which || {};

              prev[id] = {
                name,
                symbol,
                brief,
                description,
                tokens: tokenCategoryLookup[id],
              };

              return prev;
            },
            {} as PoolCategoryLookup
          );
        } else {
          const metadataCollection = this.helpers.initialized.map((pool) =>
            GraphqlService.getCategoryMetadata(pool.category)
          );
          const fulfilledMetadataCollection = await Promise.all(
            metadataCollection
          );

          this.categoryLookup = this.helpers.initialized.reduce(
            (prev, next, index) => {
              const id = formatCategoryIdWithPrefix(next.category);
              const {
                name,
                brief,
                symbol,
                description,
              } = fulfilledMetadataCollection[index];

              prev[id] = { name, brief, symbol, description, tokens: [] };

              return prev;
            },
            {} as PoolCategoryLookup
          );
        }

        this.requestInFlight = false;
      } else {
        this.disconnectWithError(
          ERRORS.Web3Service.fetchCategoriesBeforeHelpers
        );
      }
    }
  };

  /**
   * Asynchronously retrieves pool metadata based on pool helpers.
   * Sets entries on property `this.metadataLookup`
   *
   * @throws noRelevantHelper
   * @throws fetchMetadataBeforeHelpers
   * @returns Promise<void>
   */
  private fetchMetadata = async () => {
    if (this.helpers) {
      for (const { pool } of this.pools) {
        const { indexPool } = pool;
        const relevantHelper = this.helpers.initialized.find(
          (helper) => helper.address.toLowerCase() === indexPool.toLowerCase()
        );

        if (relevantHelper) {
          const {
            name: indexPoolName,
            symbol: indexPoolSymbol,
          } = relevantHelper;
          const indexPoolTokenSymbols = relevantHelper.tokens.map(
            (token) => token.symbol
          );
          const stakingSymbol = pool.isWethPair
            ? buildWethSymbol(indexPoolSymbol)
            : indexPoolSymbol;

          this.metadataLookup[pool.address] = {
            indexPoolName,
            indexPoolSymbol,
            indexPoolTokenSymbols,
            stakingSymbol,
          };
        } else {
          this.disconnectWithError(ERRORS.Web3Service.noRelevantHelper);
        }
      }
    } else {
      this.disconnectWithError(ERRORS.Web3Service.fetchMetadataBeforeHelpers);
    }
  };

  /**
   * Asynchronously retrieves pool tokens based on the currently active pool.
   * Sets property `this.tokens`
   *
   * @remarks
   * - Places a specified token first in the collection.
   *
   * @throws poolMissingMetadata
   * @throws fetchTokensPriorToPools
   * @throws fetchTokensPriorToConnect
   * @returns Promise<void>
   */
  private fetchTokens = async () => {
    if (this.provider) {
      if (this.activePool) {
        const { pool } = this.activePool;
        const metadata = this.metadataLookup[pool.address];

        if (metadata) {
          // TODO: Why is this slice necessary?
          const validTargets = metadata.indexPoolTokenSymbols.slice(0, 4);

          if (validTargets.includes(DEFAULT_TOKEN)) {
            const otherTokens = validTargets.filter(
              (target) => target !== DEFAULT_TOKEN
            );

            this.tokens = [DEFAULT_TOKEN, ...otherTokens];
          } else {
            this.tokens = validTargets;
          }
        } else {
          this.disconnectWithError(ERRORS.Web3Service.poolMissingMetadata);
        }
      } else {
        this.disconnectWithError(ERRORS.Web3Service.fetchTokensPriorToPools);
      }
    } else {
      this.disconnectWithError(ERRORS.Web3Service.fetchTokensPriorToConnect);
    }
  };

  /**
   * Disconnects and throws an error. Basic abstraction.
   *
   * @param string - The error to throw.
   * @returns void
   */
  private disconnectWithError = (error: string) => {
    this.disconnect();

    throw new Error(error);
  };
}

// #region Helpers
export const formatCategoryIdWithPrefix = (id: number): string =>
  `0x${id.toString(16)}`;

export const buildWethSymbol = (indexPoolSymbol: string): string =>
  `UNIV2:ETH-${indexPoolSymbol}`;
// #endregion

(window as any).w3 = Web3Service;

// #region Internal Models
export interface PoolMetadata {
  indexPoolName: string;
  indexPoolSymbol: string;
  indexPoolTokenSymbols: string[];
  stakingSymbol: string;
}

export type PoolMetadataLookup = Record<string, PoolMetadata>;

export interface PoolCategoryToken {
  id: string;
  name: string;
  symbol: string;
  priceUSD: string;
}

export interface PoolCategory {
  description: string;
  name: string;
  symbol: string;
  brief: string;
  tokens: PoolCategoryToken[];
}

export type PoolCategoryLookup = Record<string, PoolCategory>;

export interface NormalizedToken {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  priceUsd: number;
  ready: boolean;
  current: {
    balance: string; // From BN
    denorm: string; // From BN
    weight: string; // From BN
  };
  desired: {
    denorm: string; // From BN
    weight: string; // From BN
  };
  used: {
    balance: string; // From BN
    denorm: string; // From BN
    weight: string; // From BN
  };
}

export interface NormalizedPool {
  chainId: number;
  lastUpdate: number;
  size: number;
  maxTotalSupply: string; // From BN
  isPublic: boolean;
  addresses: {
    primary: string;
    initializer: string;
    index: string;
  };
  index: {
    name: string;
    symbol: string;
  };
  category: number;
  fees: {
    swap: string; // From BN
    totalUsd: string;
  };
  totals: {
    supply: string; // From BN
    swapVolumeUsd: string;
    valueLockedUsd: string;
    volumeUsd: string; // From BN
    weight: string; // From BN
  };
  tokens: NormalizedToken[];
}

export type BaseToken = {
  address: string;
  decimals: number;
  symbol: string;
};
// #endregion
