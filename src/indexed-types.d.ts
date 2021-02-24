export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Bytes: any;
  BigInt: any;
  BigDecimal: any;
};




export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}



export type Block_Height = {
  hash?: Maybe<Scalars['Bytes']>;
  number?: Maybe<Scalars['Int']>;
};


export type Category = {
  __typename?: 'Category';
  id: Scalars['ID'];
  metadataHash: Scalars['Bytes'];
  tokens: Array<Token>;
  indexPools: Array<IndexPool>;
};


export type CategoryTokensArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Token_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Token_Filter>;
};


export type CategoryIndexPoolsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<IndexPool_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<IndexPool_Filter>;
};

export type Category_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  metadataHash?: Maybe<Scalars['Bytes']>;
  metadataHash_not?: Maybe<Scalars['Bytes']>;
  metadataHash_in?: Maybe<Array<Scalars['Bytes']>>;
  metadataHash_not_in?: Maybe<Array<Scalars['Bytes']>>;
  metadataHash_contains?: Maybe<Scalars['Bytes']>;
  metadataHash_not_contains?: Maybe<Scalars['Bytes']>;
  tokens?: Maybe<Array<Scalars['String']>>;
  tokens_not?: Maybe<Array<Scalars['String']>>;
  tokens_contains?: Maybe<Array<Scalars['String']>>;
  tokens_not_contains?: Maybe<Array<Scalars['String']>>;
};

export enum Category_OrderBy {
  Id = 'id',
  MetadataHash = 'metadataHash',
  Tokens = 'tokens',
  IndexPools = 'indexPools'
}

export type CategoryManager = {
  __typename?: 'CategoryManager';
  id: Scalars['ID'];
  categoryIndex?: Maybe<Scalars['Int']>;
  poolsList: Array<Scalars['String']>;
};

export type CategoryManager_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  categoryIndex?: Maybe<Scalars['Int']>;
  categoryIndex_not?: Maybe<Scalars['Int']>;
  categoryIndex_gt?: Maybe<Scalars['Int']>;
  categoryIndex_lt?: Maybe<Scalars['Int']>;
  categoryIndex_gte?: Maybe<Scalars['Int']>;
  categoryIndex_lte?: Maybe<Scalars['Int']>;
  categoryIndex_in?: Maybe<Array<Scalars['Int']>>;
  categoryIndex_not_in?: Maybe<Array<Scalars['Int']>>;
  poolsList?: Maybe<Array<Scalars['String']>>;
  poolsList_not?: Maybe<Array<Scalars['String']>>;
  poolsList_contains?: Maybe<Array<Scalars['String']>>;
  poolsList_not_contains?: Maybe<Array<Scalars['String']>>;
};

export enum CategoryManager_OrderBy {
  Id = 'id',
  CategoryIndex = 'categoryIndex',
  PoolsList = 'poolsList'
}

export type DailyDistributionSnapshot = {
  __typename?: 'DailyDistributionSnapshot';
  id: Scalars['ID'];
  active: Scalars['BigInt'];
  inactive: Scalars['BigInt'];
  delegated: Scalars['BigInt'];
  voters: Scalars['Int'];
};

export type DailyDistributionSnapshot_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  active?: Maybe<Scalars['BigInt']>;
  active_not?: Maybe<Scalars['BigInt']>;
  active_gt?: Maybe<Scalars['BigInt']>;
  active_lt?: Maybe<Scalars['BigInt']>;
  active_gte?: Maybe<Scalars['BigInt']>;
  active_lte?: Maybe<Scalars['BigInt']>;
  active_in?: Maybe<Array<Scalars['BigInt']>>;
  active_not_in?: Maybe<Array<Scalars['BigInt']>>;
  inactive?: Maybe<Scalars['BigInt']>;
  inactive_not?: Maybe<Scalars['BigInt']>;
  inactive_gt?: Maybe<Scalars['BigInt']>;
  inactive_lt?: Maybe<Scalars['BigInt']>;
  inactive_gte?: Maybe<Scalars['BigInt']>;
  inactive_lte?: Maybe<Scalars['BigInt']>;
  inactive_in?: Maybe<Array<Scalars['BigInt']>>;
  inactive_not_in?: Maybe<Array<Scalars['BigInt']>>;
  delegated?: Maybe<Scalars['BigInt']>;
  delegated_not?: Maybe<Scalars['BigInt']>;
  delegated_gt?: Maybe<Scalars['BigInt']>;
  delegated_lt?: Maybe<Scalars['BigInt']>;
  delegated_gte?: Maybe<Scalars['BigInt']>;
  delegated_lte?: Maybe<Scalars['BigInt']>;
  delegated_in?: Maybe<Array<Scalars['BigInt']>>;
  delegated_not_in?: Maybe<Array<Scalars['BigInt']>>;
  voters?: Maybe<Scalars['Int']>;
  voters_not?: Maybe<Scalars['Int']>;
  voters_gt?: Maybe<Scalars['Int']>;
  voters_lt?: Maybe<Scalars['Int']>;
  voters_gte?: Maybe<Scalars['Int']>;
  voters_lte?: Maybe<Scalars['Int']>;
  voters_in?: Maybe<Array<Scalars['Int']>>;
  voters_not_in?: Maybe<Array<Scalars['Int']>>;
};

export enum DailyDistributionSnapshot_OrderBy {
  Id = 'id',
  Active = 'active',
  Inactive = 'inactive',
  Delegated = 'delegated',
  Voters = 'voters'
}

export type DailyPoolSnapshot = {
  __typename?: 'DailyPoolSnapshot';
  id: Scalars['ID'];
  date: Scalars['Int'];
  feesTotalUSD: Scalars['BigDecimal'];
  totalValueLockedUSD: Scalars['BigDecimal'];
  totalSwapVolumeUSD: Scalars['BigDecimal'];
  totalSupply: Scalars['BigDecimal'];
  value: Scalars['BigDecimal'];
  tokens: Array<Scalars['Bytes']>;
  balances: Array<Scalars['BigInt']>;
  denorms: Array<Scalars['BigInt']>;
  desiredDenorms: Array<Scalars['BigInt']>;
  pool: IndexPool;
  totalVolumeUSD: Scalars['BigDecimal'];
};

export type DailyPoolSnapshot_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  date?: Maybe<Scalars['Int']>;
  date_not?: Maybe<Scalars['Int']>;
  date_gt?: Maybe<Scalars['Int']>;
  date_lt?: Maybe<Scalars['Int']>;
  date_gte?: Maybe<Scalars['Int']>;
  date_lte?: Maybe<Scalars['Int']>;
  date_in?: Maybe<Array<Scalars['Int']>>;
  date_not_in?: Maybe<Array<Scalars['Int']>>;
  feesTotalUSD?: Maybe<Scalars['BigDecimal']>;
  feesTotalUSD_not?: Maybe<Scalars['BigDecimal']>;
  feesTotalUSD_gt?: Maybe<Scalars['BigDecimal']>;
  feesTotalUSD_lt?: Maybe<Scalars['BigDecimal']>;
  feesTotalUSD_gte?: Maybe<Scalars['BigDecimal']>;
  feesTotalUSD_lte?: Maybe<Scalars['BigDecimal']>;
  feesTotalUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesTotalUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalSwapVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  totalSwapVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalSwapVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalSwapVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalSwapVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalSwapVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalSwapVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalSwapVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalSupply?: Maybe<Scalars['BigDecimal']>;
  totalSupply_not?: Maybe<Scalars['BigDecimal']>;
  totalSupply_gt?: Maybe<Scalars['BigDecimal']>;
  totalSupply_lt?: Maybe<Scalars['BigDecimal']>;
  totalSupply_gte?: Maybe<Scalars['BigDecimal']>;
  totalSupply_lte?: Maybe<Scalars['BigDecimal']>;
  totalSupply_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalSupply_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  value?: Maybe<Scalars['BigDecimal']>;
  value_not?: Maybe<Scalars['BigDecimal']>;
  value_gt?: Maybe<Scalars['BigDecimal']>;
  value_lt?: Maybe<Scalars['BigDecimal']>;
  value_gte?: Maybe<Scalars['BigDecimal']>;
  value_lte?: Maybe<Scalars['BigDecimal']>;
  value_in?: Maybe<Array<Scalars['BigDecimal']>>;
  value_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  tokens?: Maybe<Array<Scalars['Bytes']>>;
  tokens_not?: Maybe<Array<Scalars['Bytes']>>;
  tokens_contains?: Maybe<Array<Scalars['Bytes']>>;
  tokens_not_contains?: Maybe<Array<Scalars['Bytes']>>;
  balances?: Maybe<Array<Scalars['BigInt']>>;
  balances_not?: Maybe<Array<Scalars['BigInt']>>;
  balances_contains?: Maybe<Array<Scalars['BigInt']>>;
  balances_not_contains?: Maybe<Array<Scalars['BigInt']>>;
  denorms?: Maybe<Array<Scalars['BigInt']>>;
  denorms_not?: Maybe<Array<Scalars['BigInt']>>;
  denorms_contains?: Maybe<Array<Scalars['BigInt']>>;
  denorms_not_contains?: Maybe<Array<Scalars['BigInt']>>;
  desiredDenorms?: Maybe<Array<Scalars['BigInt']>>;
  desiredDenorms_not?: Maybe<Array<Scalars['BigInt']>>;
  desiredDenorms_contains?: Maybe<Array<Scalars['BigInt']>>;
  desiredDenorms_not_contains?: Maybe<Array<Scalars['BigInt']>>;
  pool?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  totalVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum DailyPoolSnapshot_OrderBy {
  Id = 'id',
  Date = 'date',
  FeesTotalUsd = 'feesTotalUSD',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  TotalSwapVolumeUsd = 'totalSwapVolumeUSD',
  TotalSupply = 'totalSupply',
  Value = 'value',
  Tokens = 'tokens',
  Balances = 'balances',
  Denorms = 'denorms',
  DesiredDenorms = 'desiredDenorms',
  Pool = 'pool',
  TotalVolumeUsd = 'totalVolumeUSD'
}

export type IndexPool = {
  __typename?: 'IndexPool';
  id: Scalars['ID'];
  category: Category;
  name: Scalars['String'];
  symbol: Scalars['String'];
  totalSupply: Scalars['BigInt'];
  maxTotalSupply: Scalars['BigInt'];
  size: Scalars['Int'];
  isPublic: Scalars['Boolean'];
  initialized: Scalars['Boolean'];
  tokensList: Array<Scalars['Bytes']>;
  tokenSeller?: Maybe<TokenSeller>;
  poolInitializer?: Maybe<PoolInitializer>;
  tokens?: Maybe<Array<PoolUnderlyingToken>>;
  balances?: Maybe<Array<IndexPoolBalance>>;
  totalWeight: Scalars['BigInt'];
  swapFee: Scalars['BigDecimal'];
  dailySnapshots: Array<DailyPoolSnapshot>;
  feesTotalUSD: Scalars['BigDecimal'];
  totalValueLockedUSD: Scalars['BigDecimal'];
  totalSwapVolumeUSD: Scalars['BigDecimal'];
  totalVolumeUSD: Scalars['BigDecimal'];
};


export type IndexPoolTokensArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolUnderlyingToken_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<PoolUnderlyingToken_Filter>;
};


export type IndexPoolBalancesArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<IndexPoolBalance_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<IndexPoolBalance_Filter>;
};


export type IndexPoolDailySnapshotsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<DailyPoolSnapshot_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<DailyPoolSnapshot_Filter>;
};

export type IndexPool_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  category?: Maybe<Scalars['String']>;
  category_not?: Maybe<Scalars['String']>;
  category_gt?: Maybe<Scalars['String']>;
  category_lt?: Maybe<Scalars['String']>;
  category_gte?: Maybe<Scalars['String']>;
  category_lte?: Maybe<Scalars['String']>;
  category_in?: Maybe<Array<Scalars['String']>>;
  category_not_in?: Maybe<Array<Scalars['String']>>;
  category_contains?: Maybe<Scalars['String']>;
  category_not_contains?: Maybe<Scalars['String']>;
  category_starts_with?: Maybe<Scalars['String']>;
  category_not_starts_with?: Maybe<Scalars['String']>;
  category_ends_with?: Maybe<Scalars['String']>;
  category_not_ends_with?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_gt?: Maybe<Scalars['String']>;
  name_lt?: Maybe<Scalars['String']>;
  name_gte?: Maybe<Scalars['String']>;
  name_lte?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Scalars['String']>>;
  name_not_in?: Maybe<Array<Scalars['String']>>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  symbol?: Maybe<Scalars['String']>;
  symbol_not?: Maybe<Scalars['String']>;
  symbol_gt?: Maybe<Scalars['String']>;
  symbol_lt?: Maybe<Scalars['String']>;
  symbol_gte?: Maybe<Scalars['String']>;
  symbol_lte?: Maybe<Scalars['String']>;
  symbol_in?: Maybe<Array<Scalars['String']>>;
  symbol_not_in?: Maybe<Array<Scalars['String']>>;
  symbol_contains?: Maybe<Scalars['String']>;
  symbol_not_contains?: Maybe<Scalars['String']>;
  symbol_starts_with?: Maybe<Scalars['String']>;
  symbol_not_starts_with?: Maybe<Scalars['String']>;
  symbol_ends_with?: Maybe<Scalars['String']>;
  symbol_not_ends_with?: Maybe<Scalars['String']>;
  totalSupply?: Maybe<Scalars['BigInt']>;
  totalSupply_not?: Maybe<Scalars['BigInt']>;
  totalSupply_gt?: Maybe<Scalars['BigInt']>;
  totalSupply_lt?: Maybe<Scalars['BigInt']>;
  totalSupply_gte?: Maybe<Scalars['BigInt']>;
  totalSupply_lte?: Maybe<Scalars['BigInt']>;
  totalSupply_in?: Maybe<Array<Scalars['BigInt']>>;
  totalSupply_not_in?: Maybe<Array<Scalars['BigInt']>>;
  maxTotalSupply?: Maybe<Scalars['BigInt']>;
  maxTotalSupply_not?: Maybe<Scalars['BigInt']>;
  maxTotalSupply_gt?: Maybe<Scalars['BigInt']>;
  maxTotalSupply_lt?: Maybe<Scalars['BigInt']>;
  maxTotalSupply_gte?: Maybe<Scalars['BigInt']>;
  maxTotalSupply_lte?: Maybe<Scalars['BigInt']>;
  maxTotalSupply_in?: Maybe<Array<Scalars['BigInt']>>;
  maxTotalSupply_not_in?: Maybe<Array<Scalars['BigInt']>>;
  size?: Maybe<Scalars['Int']>;
  size_not?: Maybe<Scalars['Int']>;
  size_gt?: Maybe<Scalars['Int']>;
  size_lt?: Maybe<Scalars['Int']>;
  size_gte?: Maybe<Scalars['Int']>;
  size_lte?: Maybe<Scalars['Int']>;
  size_in?: Maybe<Array<Scalars['Int']>>;
  size_not_in?: Maybe<Array<Scalars['Int']>>;
  isPublic?: Maybe<Scalars['Boolean']>;
  isPublic_not?: Maybe<Scalars['Boolean']>;
  isPublic_in?: Maybe<Array<Scalars['Boolean']>>;
  isPublic_not_in?: Maybe<Array<Scalars['Boolean']>>;
  initialized?: Maybe<Scalars['Boolean']>;
  initialized_not?: Maybe<Scalars['Boolean']>;
  initialized_in?: Maybe<Array<Scalars['Boolean']>>;
  initialized_not_in?: Maybe<Array<Scalars['Boolean']>>;
  tokensList?: Maybe<Array<Scalars['Bytes']>>;
  tokensList_not?: Maybe<Array<Scalars['Bytes']>>;
  tokensList_contains?: Maybe<Array<Scalars['Bytes']>>;
  tokensList_not_contains?: Maybe<Array<Scalars['Bytes']>>;
  totalWeight?: Maybe<Scalars['BigInt']>;
  totalWeight_not?: Maybe<Scalars['BigInt']>;
  totalWeight_gt?: Maybe<Scalars['BigInt']>;
  totalWeight_lt?: Maybe<Scalars['BigInt']>;
  totalWeight_gte?: Maybe<Scalars['BigInt']>;
  totalWeight_lte?: Maybe<Scalars['BigInt']>;
  totalWeight_in?: Maybe<Array<Scalars['BigInt']>>;
  totalWeight_not_in?: Maybe<Array<Scalars['BigInt']>>;
  swapFee?: Maybe<Scalars['BigDecimal']>;
  swapFee_not?: Maybe<Scalars['BigDecimal']>;
  swapFee_gt?: Maybe<Scalars['BigDecimal']>;
  swapFee_lt?: Maybe<Scalars['BigDecimal']>;
  swapFee_gte?: Maybe<Scalars['BigDecimal']>;
  swapFee_lte?: Maybe<Scalars['BigDecimal']>;
  swapFee_in?: Maybe<Array<Scalars['BigDecimal']>>;
  swapFee_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesTotalUSD?: Maybe<Scalars['BigDecimal']>;
  feesTotalUSD_not?: Maybe<Scalars['BigDecimal']>;
  feesTotalUSD_gt?: Maybe<Scalars['BigDecimal']>;
  feesTotalUSD_lt?: Maybe<Scalars['BigDecimal']>;
  feesTotalUSD_gte?: Maybe<Scalars['BigDecimal']>;
  feesTotalUSD_lte?: Maybe<Scalars['BigDecimal']>;
  feesTotalUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesTotalUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalSwapVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  totalSwapVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalSwapVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalSwapVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalSwapVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalSwapVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalSwapVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalSwapVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum IndexPool_OrderBy {
  Id = 'id',
  Category = 'category',
  Name = 'name',
  Symbol = 'symbol',
  TotalSupply = 'totalSupply',
  MaxTotalSupply = 'maxTotalSupply',
  Size = 'size',
  IsPublic = 'isPublic',
  Initialized = 'initialized',
  TokensList = 'tokensList',
  TokenSeller = 'tokenSeller',
  PoolInitializer = 'poolInitializer',
  Tokens = 'tokens',
  Balances = 'balances',
  TotalWeight = 'totalWeight',
  SwapFee = 'swapFee',
  DailySnapshots = 'dailySnapshots',
  FeesTotalUsd = 'feesTotalUSD',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  TotalSwapVolumeUsd = 'totalSwapVolumeUSD',
  TotalVolumeUsd = 'totalVolumeUSD'
}

export type IndexPoolBalance = {
  __typename?: 'IndexPoolBalance';
  id: Scalars['ID'];
  pool: IndexPool;
  balance: Scalars['BigInt'];
};

export type IndexPoolBalance_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  pool?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  balance?: Maybe<Scalars['BigInt']>;
  balance_not?: Maybe<Scalars['BigInt']>;
  balance_gt?: Maybe<Scalars['BigInt']>;
  balance_lt?: Maybe<Scalars['BigInt']>;
  balance_gte?: Maybe<Scalars['BigInt']>;
  balance_lte?: Maybe<Scalars['BigInt']>;
  balance_in?: Maybe<Array<Scalars['BigInt']>>;
  balance_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum IndexPoolBalance_OrderBy {
  Id = 'id',
  Pool = 'pool',
  Balance = 'balance'
}

export type InitializerToken = {
  __typename?: 'InitializerToken';
  id: Scalars['ID'];
  poolInitializer: PoolInitializer;
  token: Token;
  targetBalance: Scalars['BigInt'];
  balance: Scalars['BigInt'];
  amountRemaining: Scalars['BigInt'];
};

export type InitializerToken_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  poolInitializer?: Maybe<Scalars['String']>;
  poolInitializer_not?: Maybe<Scalars['String']>;
  poolInitializer_gt?: Maybe<Scalars['String']>;
  poolInitializer_lt?: Maybe<Scalars['String']>;
  poolInitializer_gte?: Maybe<Scalars['String']>;
  poolInitializer_lte?: Maybe<Scalars['String']>;
  poolInitializer_in?: Maybe<Array<Scalars['String']>>;
  poolInitializer_not_in?: Maybe<Array<Scalars['String']>>;
  poolInitializer_contains?: Maybe<Scalars['String']>;
  poolInitializer_not_contains?: Maybe<Scalars['String']>;
  poolInitializer_starts_with?: Maybe<Scalars['String']>;
  poolInitializer_not_starts_with?: Maybe<Scalars['String']>;
  poolInitializer_ends_with?: Maybe<Scalars['String']>;
  poolInitializer_not_ends_with?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
  token_not?: Maybe<Scalars['String']>;
  token_gt?: Maybe<Scalars['String']>;
  token_lt?: Maybe<Scalars['String']>;
  token_gte?: Maybe<Scalars['String']>;
  token_lte?: Maybe<Scalars['String']>;
  token_in?: Maybe<Array<Scalars['String']>>;
  token_not_in?: Maybe<Array<Scalars['String']>>;
  token_contains?: Maybe<Scalars['String']>;
  token_not_contains?: Maybe<Scalars['String']>;
  token_starts_with?: Maybe<Scalars['String']>;
  token_not_starts_with?: Maybe<Scalars['String']>;
  token_ends_with?: Maybe<Scalars['String']>;
  token_not_ends_with?: Maybe<Scalars['String']>;
  targetBalance?: Maybe<Scalars['BigInt']>;
  targetBalance_not?: Maybe<Scalars['BigInt']>;
  targetBalance_gt?: Maybe<Scalars['BigInt']>;
  targetBalance_lt?: Maybe<Scalars['BigInt']>;
  targetBalance_gte?: Maybe<Scalars['BigInt']>;
  targetBalance_lte?: Maybe<Scalars['BigInt']>;
  targetBalance_in?: Maybe<Array<Scalars['BigInt']>>;
  targetBalance_not_in?: Maybe<Array<Scalars['BigInt']>>;
  balance?: Maybe<Scalars['BigInt']>;
  balance_not?: Maybe<Scalars['BigInt']>;
  balance_gt?: Maybe<Scalars['BigInt']>;
  balance_lt?: Maybe<Scalars['BigInt']>;
  balance_gte?: Maybe<Scalars['BigInt']>;
  balance_lte?: Maybe<Scalars['BigInt']>;
  balance_in?: Maybe<Array<Scalars['BigInt']>>;
  balance_not_in?: Maybe<Array<Scalars['BigInt']>>;
  amountRemaining?: Maybe<Scalars['BigInt']>;
  amountRemaining_not?: Maybe<Scalars['BigInt']>;
  amountRemaining_gt?: Maybe<Scalars['BigInt']>;
  amountRemaining_lt?: Maybe<Scalars['BigInt']>;
  amountRemaining_gte?: Maybe<Scalars['BigInt']>;
  amountRemaining_lte?: Maybe<Scalars['BigInt']>;
  amountRemaining_in?: Maybe<Array<Scalars['BigInt']>>;
  amountRemaining_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum InitializerToken_OrderBy {
  Id = 'id',
  PoolInitializer = 'poolInitializer',
  Token = 'token',
  TargetBalance = 'targetBalance',
  Balance = 'balance',
  AmountRemaining = 'amountRemaining'
}

export type Mint = {
  __typename?: 'Mint';
  id: Scalars['ID'];
};

export type Mint_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
};

export enum Mint_OrderBy {
  Id = 'id'
}

export type NdxStakingPool = {
  __typename?: 'NdxStakingPool';
  id: Scalars['ID'];
  startsAt: Scalars['Int'];
  isReady: Scalars['Boolean'];
  isWethPair: Scalars['Boolean'];
  indexPool: Scalars['Bytes'];
  stakingToken: Scalars['Bytes'];
  totalSupply: Scalars['BigInt'];
  rewardPerTokenStored: Scalars['BigInt'];
  periodFinish: Scalars['Int'];
  lastUpdateTime: Scalars['Int'];
  totalRewards: Scalars['BigInt'];
  claimedRewards: Scalars['BigInt'];
  rewardRate: Scalars['BigInt'];
};

export type NdxStakingPool_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  startsAt?: Maybe<Scalars['Int']>;
  startsAt_not?: Maybe<Scalars['Int']>;
  startsAt_gt?: Maybe<Scalars['Int']>;
  startsAt_lt?: Maybe<Scalars['Int']>;
  startsAt_gte?: Maybe<Scalars['Int']>;
  startsAt_lte?: Maybe<Scalars['Int']>;
  startsAt_in?: Maybe<Array<Scalars['Int']>>;
  startsAt_not_in?: Maybe<Array<Scalars['Int']>>;
  isReady?: Maybe<Scalars['Boolean']>;
  isReady_not?: Maybe<Scalars['Boolean']>;
  isReady_in?: Maybe<Array<Scalars['Boolean']>>;
  isReady_not_in?: Maybe<Array<Scalars['Boolean']>>;
  isWethPair?: Maybe<Scalars['Boolean']>;
  isWethPair_not?: Maybe<Scalars['Boolean']>;
  isWethPair_in?: Maybe<Array<Scalars['Boolean']>>;
  isWethPair_not_in?: Maybe<Array<Scalars['Boolean']>>;
  indexPool?: Maybe<Scalars['Bytes']>;
  indexPool_not?: Maybe<Scalars['Bytes']>;
  indexPool_in?: Maybe<Array<Scalars['Bytes']>>;
  indexPool_not_in?: Maybe<Array<Scalars['Bytes']>>;
  indexPool_contains?: Maybe<Scalars['Bytes']>;
  indexPool_not_contains?: Maybe<Scalars['Bytes']>;
  stakingToken?: Maybe<Scalars['Bytes']>;
  stakingToken_not?: Maybe<Scalars['Bytes']>;
  stakingToken_in?: Maybe<Array<Scalars['Bytes']>>;
  stakingToken_not_in?: Maybe<Array<Scalars['Bytes']>>;
  stakingToken_contains?: Maybe<Scalars['Bytes']>;
  stakingToken_not_contains?: Maybe<Scalars['Bytes']>;
  totalSupply?: Maybe<Scalars['BigInt']>;
  totalSupply_not?: Maybe<Scalars['BigInt']>;
  totalSupply_gt?: Maybe<Scalars['BigInt']>;
  totalSupply_lt?: Maybe<Scalars['BigInt']>;
  totalSupply_gte?: Maybe<Scalars['BigInt']>;
  totalSupply_lte?: Maybe<Scalars['BigInt']>;
  totalSupply_in?: Maybe<Array<Scalars['BigInt']>>;
  totalSupply_not_in?: Maybe<Array<Scalars['BigInt']>>;
  rewardPerTokenStored?: Maybe<Scalars['BigInt']>;
  rewardPerTokenStored_not?: Maybe<Scalars['BigInt']>;
  rewardPerTokenStored_gt?: Maybe<Scalars['BigInt']>;
  rewardPerTokenStored_lt?: Maybe<Scalars['BigInt']>;
  rewardPerTokenStored_gte?: Maybe<Scalars['BigInt']>;
  rewardPerTokenStored_lte?: Maybe<Scalars['BigInt']>;
  rewardPerTokenStored_in?: Maybe<Array<Scalars['BigInt']>>;
  rewardPerTokenStored_not_in?: Maybe<Array<Scalars['BigInt']>>;
  periodFinish?: Maybe<Scalars['Int']>;
  periodFinish_not?: Maybe<Scalars['Int']>;
  periodFinish_gt?: Maybe<Scalars['Int']>;
  periodFinish_lt?: Maybe<Scalars['Int']>;
  periodFinish_gte?: Maybe<Scalars['Int']>;
  periodFinish_lte?: Maybe<Scalars['Int']>;
  periodFinish_in?: Maybe<Array<Scalars['Int']>>;
  periodFinish_not_in?: Maybe<Array<Scalars['Int']>>;
  lastUpdateTime?: Maybe<Scalars['Int']>;
  lastUpdateTime_not?: Maybe<Scalars['Int']>;
  lastUpdateTime_gt?: Maybe<Scalars['Int']>;
  lastUpdateTime_lt?: Maybe<Scalars['Int']>;
  lastUpdateTime_gte?: Maybe<Scalars['Int']>;
  lastUpdateTime_lte?: Maybe<Scalars['Int']>;
  lastUpdateTime_in?: Maybe<Array<Scalars['Int']>>;
  lastUpdateTime_not_in?: Maybe<Array<Scalars['Int']>>;
  totalRewards?: Maybe<Scalars['BigInt']>;
  totalRewards_not?: Maybe<Scalars['BigInt']>;
  totalRewards_gt?: Maybe<Scalars['BigInt']>;
  totalRewards_lt?: Maybe<Scalars['BigInt']>;
  totalRewards_gte?: Maybe<Scalars['BigInt']>;
  totalRewards_lte?: Maybe<Scalars['BigInt']>;
  totalRewards_in?: Maybe<Array<Scalars['BigInt']>>;
  totalRewards_not_in?: Maybe<Array<Scalars['BigInt']>>;
  claimedRewards?: Maybe<Scalars['BigInt']>;
  claimedRewards_not?: Maybe<Scalars['BigInt']>;
  claimedRewards_gt?: Maybe<Scalars['BigInt']>;
  claimedRewards_lt?: Maybe<Scalars['BigInt']>;
  claimedRewards_gte?: Maybe<Scalars['BigInt']>;
  claimedRewards_lte?: Maybe<Scalars['BigInt']>;
  claimedRewards_in?: Maybe<Array<Scalars['BigInt']>>;
  claimedRewards_not_in?: Maybe<Array<Scalars['BigInt']>>;
  rewardRate?: Maybe<Scalars['BigInt']>;
  rewardRate_not?: Maybe<Scalars['BigInt']>;
  rewardRate_gt?: Maybe<Scalars['BigInt']>;
  rewardRate_lt?: Maybe<Scalars['BigInt']>;
  rewardRate_gte?: Maybe<Scalars['BigInt']>;
  rewardRate_lte?: Maybe<Scalars['BigInt']>;
  rewardRate_in?: Maybe<Array<Scalars['BigInt']>>;
  rewardRate_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum NdxStakingPool_OrderBy {
  Id = 'id',
  StartsAt = 'startsAt',
  IsReady = 'isReady',
  IsWethPair = 'isWethPair',
  IndexPool = 'indexPool',
  StakingToken = 'stakingToken',
  TotalSupply = 'totalSupply',
  RewardPerTokenStored = 'rewardPerTokenStored',
  PeriodFinish = 'periodFinish',
  LastUpdateTime = 'lastUpdateTime',
  TotalRewards = 'totalRewards',
  ClaimedRewards = 'claimedRewards',
  RewardRate = 'rewardRate'
}

export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type PoolInitializer = {
  __typename?: 'PoolInitializer';
  id: Scalars['ID'];
  pool?: Maybe<IndexPool>;
  tokens: Array<InitializerToken>;
  totalCreditedWETH: Scalars['BigInt'];
};


export type PoolInitializerTokensArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<InitializerToken_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<InitializerToken_Filter>;
};

export type PoolInitializer_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  pool?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  totalCreditedWETH?: Maybe<Scalars['BigInt']>;
  totalCreditedWETH_not?: Maybe<Scalars['BigInt']>;
  totalCreditedWETH_gt?: Maybe<Scalars['BigInt']>;
  totalCreditedWETH_lt?: Maybe<Scalars['BigInt']>;
  totalCreditedWETH_gte?: Maybe<Scalars['BigInt']>;
  totalCreditedWETH_lte?: Maybe<Scalars['BigInt']>;
  totalCreditedWETH_in?: Maybe<Array<Scalars['BigInt']>>;
  totalCreditedWETH_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum PoolInitializer_OrderBy {
  Id = 'id',
  Pool = 'pool',
  Tokens = 'tokens',
  TotalCreditedWeth = 'totalCreditedWETH'
}

export type PoolUnderlyingToken = {
  __typename?: 'PoolUnderlyingToken';
  id: Scalars['ID'];
  ready: Scalars['Boolean'];
  pool: IndexPool;
  balance: Scalars['BigInt'];
  minimumBalance?: Maybe<Scalars['BigInt']>;
  token: Token;
  denorm: Scalars['BigInt'];
  desiredDenorm: Scalars['BigInt'];
};

export type PoolUnderlyingToken_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  ready?: Maybe<Scalars['Boolean']>;
  ready_not?: Maybe<Scalars['Boolean']>;
  ready_in?: Maybe<Array<Scalars['Boolean']>>;
  ready_not_in?: Maybe<Array<Scalars['Boolean']>>;
  pool?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  balance?: Maybe<Scalars['BigInt']>;
  balance_not?: Maybe<Scalars['BigInt']>;
  balance_gt?: Maybe<Scalars['BigInt']>;
  balance_lt?: Maybe<Scalars['BigInt']>;
  balance_gte?: Maybe<Scalars['BigInt']>;
  balance_lte?: Maybe<Scalars['BigInt']>;
  balance_in?: Maybe<Array<Scalars['BigInt']>>;
  balance_not_in?: Maybe<Array<Scalars['BigInt']>>;
  minimumBalance?: Maybe<Scalars['BigInt']>;
  minimumBalance_not?: Maybe<Scalars['BigInt']>;
  minimumBalance_gt?: Maybe<Scalars['BigInt']>;
  minimumBalance_lt?: Maybe<Scalars['BigInt']>;
  minimumBalance_gte?: Maybe<Scalars['BigInt']>;
  minimumBalance_lte?: Maybe<Scalars['BigInt']>;
  minimumBalance_in?: Maybe<Array<Scalars['BigInt']>>;
  minimumBalance_not_in?: Maybe<Array<Scalars['BigInt']>>;
  token?: Maybe<Scalars['String']>;
  token_not?: Maybe<Scalars['String']>;
  token_gt?: Maybe<Scalars['String']>;
  token_lt?: Maybe<Scalars['String']>;
  token_gte?: Maybe<Scalars['String']>;
  token_lte?: Maybe<Scalars['String']>;
  token_in?: Maybe<Array<Scalars['String']>>;
  token_not_in?: Maybe<Array<Scalars['String']>>;
  token_contains?: Maybe<Scalars['String']>;
  token_not_contains?: Maybe<Scalars['String']>;
  token_starts_with?: Maybe<Scalars['String']>;
  token_not_starts_with?: Maybe<Scalars['String']>;
  token_ends_with?: Maybe<Scalars['String']>;
  token_not_ends_with?: Maybe<Scalars['String']>;
  denorm?: Maybe<Scalars['BigInt']>;
  denorm_not?: Maybe<Scalars['BigInt']>;
  denorm_gt?: Maybe<Scalars['BigInt']>;
  denorm_lt?: Maybe<Scalars['BigInt']>;
  denorm_gte?: Maybe<Scalars['BigInt']>;
  denorm_lte?: Maybe<Scalars['BigInt']>;
  denorm_in?: Maybe<Array<Scalars['BigInt']>>;
  denorm_not_in?: Maybe<Array<Scalars['BigInt']>>;
  desiredDenorm?: Maybe<Scalars['BigInt']>;
  desiredDenorm_not?: Maybe<Scalars['BigInt']>;
  desiredDenorm_gt?: Maybe<Scalars['BigInt']>;
  desiredDenorm_lt?: Maybe<Scalars['BigInt']>;
  desiredDenorm_gte?: Maybe<Scalars['BigInt']>;
  desiredDenorm_lte?: Maybe<Scalars['BigInt']>;
  desiredDenorm_in?: Maybe<Array<Scalars['BigInt']>>;
  desiredDenorm_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum PoolUnderlyingToken_OrderBy {
  Id = 'id',
  Ready = 'ready',
  Pool = 'pool',
  Balance = 'balance',
  MinimumBalance = 'minimumBalance',
  Token = 'token',
  Denorm = 'denorm',
  DesiredDenorm = 'desiredDenorm'
}

export type Proposal = {
  __typename?: 'Proposal';
  id: Scalars['ID'];
  state: Scalars['String'];
  proposer: Scalars['Bytes'];
  eta?: Maybe<Scalars['Int']>;
  action?: Maybe<Scalars['Bytes']>;
  expiry: Scalars['Int'];
  for: Scalars['BigInt'];
  against: Scalars['BigInt'];
  startBlock: Scalars['BigInt'];
  votes: Array<Vote>;
  targets: Array<Scalars['Bytes']>;
  values: Array<Scalars['BigInt']>;
  signatures: Array<Scalars['String']>;
  description: Scalars['String'];
  title: Scalars['String'];
  calldatas: Array<Scalars['Bytes']>;
};


export type ProposalVotesArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Vote_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Vote_Filter>;
};

export type Proposal_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  state?: Maybe<Scalars['String']>;
  state_not?: Maybe<Scalars['String']>;
  state_gt?: Maybe<Scalars['String']>;
  state_lt?: Maybe<Scalars['String']>;
  state_gte?: Maybe<Scalars['String']>;
  state_lte?: Maybe<Scalars['String']>;
  state_in?: Maybe<Array<Scalars['String']>>;
  state_not_in?: Maybe<Array<Scalars['String']>>;
  state_contains?: Maybe<Scalars['String']>;
  state_not_contains?: Maybe<Scalars['String']>;
  state_starts_with?: Maybe<Scalars['String']>;
  state_not_starts_with?: Maybe<Scalars['String']>;
  state_ends_with?: Maybe<Scalars['String']>;
  state_not_ends_with?: Maybe<Scalars['String']>;
  proposer?: Maybe<Scalars['Bytes']>;
  proposer_not?: Maybe<Scalars['Bytes']>;
  proposer_in?: Maybe<Array<Scalars['Bytes']>>;
  proposer_not_in?: Maybe<Array<Scalars['Bytes']>>;
  proposer_contains?: Maybe<Scalars['Bytes']>;
  proposer_not_contains?: Maybe<Scalars['Bytes']>;
  eta?: Maybe<Scalars['Int']>;
  eta_not?: Maybe<Scalars['Int']>;
  eta_gt?: Maybe<Scalars['Int']>;
  eta_lt?: Maybe<Scalars['Int']>;
  eta_gte?: Maybe<Scalars['Int']>;
  eta_lte?: Maybe<Scalars['Int']>;
  eta_in?: Maybe<Array<Scalars['Int']>>;
  eta_not_in?: Maybe<Array<Scalars['Int']>>;
  action?: Maybe<Scalars['Bytes']>;
  action_not?: Maybe<Scalars['Bytes']>;
  action_in?: Maybe<Array<Scalars['Bytes']>>;
  action_not_in?: Maybe<Array<Scalars['Bytes']>>;
  action_contains?: Maybe<Scalars['Bytes']>;
  action_not_contains?: Maybe<Scalars['Bytes']>;
  expiry?: Maybe<Scalars['Int']>;
  expiry_not?: Maybe<Scalars['Int']>;
  expiry_gt?: Maybe<Scalars['Int']>;
  expiry_lt?: Maybe<Scalars['Int']>;
  expiry_gte?: Maybe<Scalars['Int']>;
  expiry_lte?: Maybe<Scalars['Int']>;
  expiry_in?: Maybe<Array<Scalars['Int']>>;
  expiry_not_in?: Maybe<Array<Scalars['Int']>>;
  for?: Maybe<Scalars['BigInt']>;
  for_not?: Maybe<Scalars['BigInt']>;
  for_gt?: Maybe<Scalars['BigInt']>;
  for_lt?: Maybe<Scalars['BigInt']>;
  for_gte?: Maybe<Scalars['BigInt']>;
  for_lte?: Maybe<Scalars['BigInt']>;
  for_in?: Maybe<Array<Scalars['BigInt']>>;
  for_not_in?: Maybe<Array<Scalars['BigInt']>>;
  against?: Maybe<Scalars['BigInt']>;
  against_not?: Maybe<Scalars['BigInt']>;
  against_gt?: Maybe<Scalars['BigInt']>;
  against_lt?: Maybe<Scalars['BigInt']>;
  against_gte?: Maybe<Scalars['BigInt']>;
  against_lte?: Maybe<Scalars['BigInt']>;
  against_in?: Maybe<Array<Scalars['BigInt']>>;
  against_not_in?: Maybe<Array<Scalars['BigInt']>>;
  startBlock?: Maybe<Scalars['BigInt']>;
  startBlock_not?: Maybe<Scalars['BigInt']>;
  startBlock_gt?: Maybe<Scalars['BigInt']>;
  startBlock_lt?: Maybe<Scalars['BigInt']>;
  startBlock_gte?: Maybe<Scalars['BigInt']>;
  startBlock_lte?: Maybe<Scalars['BigInt']>;
  startBlock_in?: Maybe<Array<Scalars['BigInt']>>;
  startBlock_not_in?: Maybe<Array<Scalars['BigInt']>>;
  votes?: Maybe<Array<Scalars['String']>>;
  votes_not?: Maybe<Array<Scalars['String']>>;
  votes_contains?: Maybe<Array<Scalars['String']>>;
  votes_not_contains?: Maybe<Array<Scalars['String']>>;
  targets?: Maybe<Array<Scalars['Bytes']>>;
  targets_not?: Maybe<Array<Scalars['Bytes']>>;
  targets_contains?: Maybe<Array<Scalars['Bytes']>>;
  targets_not_contains?: Maybe<Array<Scalars['Bytes']>>;
  values?: Maybe<Array<Scalars['BigInt']>>;
  values_not?: Maybe<Array<Scalars['BigInt']>>;
  values_contains?: Maybe<Array<Scalars['BigInt']>>;
  values_not_contains?: Maybe<Array<Scalars['BigInt']>>;
  signatures?: Maybe<Array<Scalars['String']>>;
  signatures_not?: Maybe<Array<Scalars['String']>>;
  signatures_contains?: Maybe<Array<Scalars['String']>>;
  signatures_not_contains?: Maybe<Array<Scalars['String']>>;
  description?: Maybe<Scalars['String']>;
  description_not?: Maybe<Scalars['String']>;
  description_gt?: Maybe<Scalars['String']>;
  description_lt?: Maybe<Scalars['String']>;
  description_gte?: Maybe<Scalars['String']>;
  description_lte?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Scalars['String']>>;
  description_not_in?: Maybe<Array<Scalars['String']>>;
  description_contains?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  description_starts_with?: Maybe<Scalars['String']>;
  description_not_starts_with?: Maybe<Scalars['String']>;
  description_ends_with?: Maybe<Scalars['String']>;
  description_not_ends_with?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  title_not?: Maybe<Scalars['String']>;
  title_gt?: Maybe<Scalars['String']>;
  title_lt?: Maybe<Scalars['String']>;
  title_gte?: Maybe<Scalars['String']>;
  title_lte?: Maybe<Scalars['String']>;
  title_in?: Maybe<Array<Scalars['String']>>;
  title_not_in?: Maybe<Array<Scalars['String']>>;
  title_contains?: Maybe<Scalars['String']>;
  title_not_contains?: Maybe<Scalars['String']>;
  title_starts_with?: Maybe<Scalars['String']>;
  title_not_starts_with?: Maybe<Scalars['String']>;
  title_ends_with?: Maybe<Scalars['String']>;
  title_not_ends_with?: Maybe<Scalars['String']>;
  calldatas?: Maybe<Array<Scalars['Bytes']>>;
  calldatas_not?: Maybe<Array<Scalars['Bytes']>>;
  calldatas_contains?: Maybe<Array<Scalars['Bytes']>>;
  calldatas_not_contains?: Maybe<Array<Scalars['Bytes']>>;
};

export enum Proposal_OrderBy {
  Id = 'id',
  State = 'state',
  Proposer = 'proposer',
  Eta = 'eta',
  Action = 'action',
  Expiry = 'expiry',
  For = 'for',
  Against = 'against',
  StartBlock = 'startBlock',
  Votes = 'votes',
  Targets = 'targets',
  Values = 'values',
  Signatures = 'signatures',
  Description = 'description',
  Title = 'title',
  Calldatas = 'calldatas'
}

export type Query = {
  __typename?: 'Query';
  proposal?: Maybe<Proposal>;
  proposals: Array<Proposal>;
  vote?: Maybe<Vote>;
  votes: Array<Vote>;
  dailyDistributionSnapshot?: Maybe<DailyDistributionSnapshot>;
  dailyDistributionSnapshots: Array<DailyDistributionSnapshot>;
  ndxStakingPool?: Maybe<NdxStakingPool>;
  ndxStakingPools: Array<NdxStakingPool>;
  categoryManager?: Maybe<CategoryManager>;
  categoryManagers: Array<CategoryManager>;
  category?: Maybe<Category>;
  categories: Array<Category>;
  token?: Maybe<Token>;
  tokens: Array<Token>;
  indexPool?: Maybe<IndexPool>;
  indexPools: Array<IndexPool>;
  poolUnderlyingToken?: Maybe<PoolUnderlyingToken>;
  poolUnderlyingTokens: Array<PoolUnderlyingToken>;
  dailyPoolSnapshot?: Maybe<DailyPoolSnapshot>;
  dailyPoolSnapshots: Array<DailyPoolSnapshot>;
  indexPoolBalance?: Maybe<IndexPoolBalance>;
  indexPoolBalances: Array<IndexPoolBalance>;
  poolInitializer?: Maybe<PoolInitializer>;
  poolInitializers: Array<PoolInitializer>;
  initializerToken?: Maybe<InitializerToken>;
  initializerTokens: Array<InitializerToken>;
  tokenContribution?: Maybe<TokenContribution>;
  tokenContributions: Array<TokenContribution>;
  tokenContributor?: Maybe<TokenContributor>;
  tokenContributors: Array<TokenContributor>;
  tokenSeller?: Maybe<TokenSeller>;
  tokenSellers: Array<TokenSeller>;
  tokenForSale?: Maybe<TokenForSale>;
  tokenForSales: Array<TokenForSale>;
  swap?: Maybe<Swap>;
  swaps: Array<Swap>;
  mint?: Maybe<Mint>;
  mints: Array<Mint>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QueryProposalArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryProposalsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Proposal_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Proposal_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryVoteArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryVotesArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Vote_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Vote_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryDailyDistributionSnapshotArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryDailyDistributionSnapshotsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<DailyDistributionSnapshot_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<DailyDistributionSnapshot_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryNdxStakingPoolArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryNdxStakingPoolsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<NdxStakingPool_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<NdxStakingPool_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryCategoryManagerArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryCategoryManagersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<CategoryManager_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<CategoryManager_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryCategoryArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryCategoriesArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Category_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Category_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryTokenArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryTokensArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Token_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Token_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryIndexPoolArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryIndexPoolsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<IndexPool_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<IndexPool_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryPoolUnderlyingTokenArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryPoolUnderlyingTokensArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolUnderlyingToken_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<PoolUnderlyingToken_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryDailyPoolSnapshotArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryDailyPoolSnapshotsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<DailyPoolSnapshot_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<DailyPoolSnapshot_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryIndexPoolBalanceArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryIndexPoolBalancesArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<IndexPoolBalance_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<IndexPoolBalance_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryPoolInitializerArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryPoolInitializersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolInitializer_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<PoolInitializer_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryInitializerTokenArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryInitializerTokensArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<InitializerToken_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<InitializerToken_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryTokenContributionArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryTokenContributionsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenContribution_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<TokenContribution_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryTokenContributorArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryTokenContributorsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenContributor_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<TokenContributor_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryTokenSellerArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryTokenSellersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenSeller_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<TokenSeller_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryTokenForSaleArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryTokenForSalesArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenForSale_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<TokenForSale_Filter>;
  block?: Maybe<Block_Height>;
};


export type QuerySwapArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QuerySwapsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Swap_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Swap_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryMintArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryMintsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Mint_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Mint_Filter>;
  block?: Maybe<Block_Height>;
};


export type Query_MetaArgs = {
  block?: Maybe<Block_Height>;
};

export type Subscription = {
  __typename?: 'Subscription';
  proposal?: Maybe<Proposal>;
  proposals: Array<Proposal>;
  vote?: Maybe<Vote>;
  votes: Array<Vote>;
  dailyDistributionSnapshot?: Maybe<DailyDistributionSnapshot>;
  dailyDistributionSnapshots: Array<DailyDistributionSnapshot>;
  ndxStakingPool?: Maybe<NdxStakingPool>;
  ndxStakingPools: Array<NdxStakingPool>;
  categoryManager?: Maybe<CategoryManager>;
  categoryManagers: Array<CategoryManager>;
  category?: Maybe<Category>;
  categories: Array<Category>;
  token?: Maybe<Token>;
  tokens: Array<Token>;
  indexPool?: Maybe<IndexPool>;
  indexPools: Array<IndexPool>;
  poolUnderlyingToken?: Maybe<PoolUnderlyingToken>;
  poolUnderlyingTokens: Array<PoolUnderlyingToken>;
  dailyPoolSnapshot?: Maybe<DailyPoolSnapshot>;
  dailyPoolSnapshots: Array<DailyPoolSnapshot>;
  indexPoolBalance?: Maybe<IndexPoolBalance>;
  indexPoolBalances: Array<IndexPoolBalance>;
  poolInitializer?: Maybe<PoolInitializer>;
  poolInitializers: Array<PoolInitializer>;
  initializerToken?: Maybe<InitializerToken>;
  initializerTokens: Array<InitializerToken>;
  tokenContribution?: Maybe<TokenContribution>;
  tokenContributions: Array<TokenContribution>;
  tokenContributor?: Maybe<TokenContributor>;
  tokenContributors: Array<TokenContributor>;
  tokenSeller?: Maybe<TokenSeller>;
  tokenSellers: Array<TokenSeller>;
  tokenForSale?: Maybe<TokenForSale>;
  tokenForSales: Array<TokenForSale>;
  swap?: Maybe<Swap>;
  swaps: Array<Swap>;
  mint?: Maybe<Mint>;
  mints: Array<Mint>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptionProposalArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionProposalsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Proposal_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Proposal_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionVoteArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionVotesArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Vote_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Vote_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionDailyDistributionSnapshotArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionDailyDistributionSnapshotsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<DailyDistributionSnapshot_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<DailyDistributionSnapshot_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionNdxStakingPoolArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionNdxStakingPoolsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<NdxStakingPool_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<NdxStakingPool_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionCategoryManagerArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionCategoryManagersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<CategoryManager_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<CategoryManager_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionCategoryArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionCategoriesArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Category_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Category_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionTokenArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionTokensArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Token_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Token_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionIndexPoolArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionIndexPoolsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<IndexPool_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<IndexPool_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionPoolUnderlyingTokenArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionPoolUnderlyingTokensArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolUnderlyingToken_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<PoolUnderlyingToken_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionDailyPoolSnapshotArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionDailyPoolSnapshotsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<DailyPoolSnapshot_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<DailyPoolSnapshot_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionIndexPoolBalanceArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionIndexPoolBalancesArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<IndexPoolBalance_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<IndexPoolBalance_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionPoolInitializerArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionPoolInitializersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolInitializer_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<PoolInitializer_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionInitializerTokenArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionInitializerTokensArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<InitializerToken_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<InitializerToken_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionTokenContributionArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionTokenContributionsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenContribution_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<TokenContribution_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionTokenContributorArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionTokenContributorsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenContributor_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<TokenContributor_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionTokenSellerArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionTokenSellersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenSeller_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<TokenSeller_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionTokenForSaleArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionTokenForSalesArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenForSale_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<TokenForSale_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionSwapArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionSwapsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Swap_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Swap_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionMintArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionMintsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Mint_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Mint_Filter>;
  block?: Maybe<Block_Height>;
};


export type Subscription_MetaArgs = {
  block?: Maybe<Block_Height>;
};

export type Swap = {
  __typename?: 'Swap';
  id: Scalars['ID'];
  caller: Scalars['Bytes'];
  tokenIn: Scalars['Bytes'];
  tokenOut: Scalars['Bytes'];
  tokenAmountIn: Scalars['BigInt'];
  tokenAmountOut: Scalars['BigInt'];
  pool: IndexPool;
  timestamp: Scalars['Int'];
};

export type Swap_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  caller?: Maybe<Scalars['Bytes']>;
  caller_not?: Maybe<Scalars['Bytes']>;
  caller_in?: Maybe<Array<Scalars['Bytes']>>;
  caller_not_in?: Maybe<Array<Scalars['Bytes']>>;
  caller_contains?: Maybe<Scalars['Bytes']>;
  caller_not_contains?: Maybe<Scalars['Bytes']>;
  tokenIn?: Maybe<Scalars['Bytes']>;
  tokenIn_not?: Maybe<Scalars['Bytes']>;
  tokenIn_in?: Maybe<Array<Scalars['Bytes']>>;
  tokenIn_not_in?: Maybe<Array<Scalars['Bytes']>>;
  tokenIn_contains?: Maybe<Scalars['Bytes']>;
  tokenIn_not_contains?: Maybe<Scalars['Bytes']>;
  tokenOut?: Maybe<Scalars['Bytes']>;
  tokenOut_not?: Maybe<Scalars['Bytes']>;
  tokenOut_in?: Maybe<Array<Scalars['Bytes']>>;
  tokenOut_not_in?: Maybe<Array<Scalars['Bytes']>>;
  tokenOut_contains?: Maybe<Scalars['Bytes']>;
  tokenOut_not_contains?: Maybe<Scalars['Bytes']>;
  tokenAmountIn?: Maybe<Scalars['BigInt']>;
  tokenAmountIn_not?: Maybe<Scalars['BigInt']>;
  tokenAmountIn_gt?: Maybe<Scalars['BigInt']>;
  tokenAmountIn_lt?: Maybe<Scalars['BigInt']>;
  tokenAmountIn_gte?: Maybe<Scalars['BigInt']>;
  tokenAmountIn_lte?: Maybe<Scalars['BigInt']>;
  tokenAmountIn_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountIn_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountOut?: Maybe<Scalars['BigInt']>;
  tokenAmountOut_not?: Maybe<Scalars['BigInt']>;
  tokenAmountOut_gt?: Maybe<Scalars['BigInt']>;
  tokenAmountOut_lt?: Maybe<Scalars['BigInt']>;
  tokenAmountOut_gte?: Maybe<Scalars['BigInt']>;
  tokenAmountOut_lte?: Maybe<Scalars['BigInt']>;
  tokenAmountOut_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountOut_not_in?: Maybe<Array<Scalars['BigInt']>>;
  pool?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['Int']>;
  timestamp_not?: Maybe<Scalars['Int']>;
  timestamp_gt?: Maybe<Scalars['Int']>;
  timestamp_lt?: Maybe<Scalars['Int']>;
  timestamp_gte?: Maybe<Scalars['Int']>;
  timestamp_lte?: Maybe<Scalars['Int']>;
  timestamp_in?: Maybe<Array<Scalars['Int']>>;
  timestamp_not_in?: Maybe<Array<Scalars['Int']>>;
};

export enum Swap_OrderBy {
  Id = 'id',
  Caller = 'caller',
  TokenIn = 'tokenIn',
  TokenOut = 'tokenOut',
  TokenAmountIn = 'tokenAmountIn',
  TokenAmountOut = 'tokenAmountOut',
  Pool = 'pool',
  Timestamp = 'timestamp'
}

export type Token = {
  __typename?: 'Token';
  id: Scalars['ID'];
  symbol: Scalars['String'];
  name: Scalars['String'];
  decimals: Scalars['Int'];
  priceUSD: Scalars['BigDecimal'];
};

export type Token_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  symbol?: Maybe<Scalars['String']>;
  symbol_not?: Maybe<Scalars['String']>;
  symbol_gt?: Maybe<Scalars['String']>;
  symbol_lt?: Maybe<Scalars['String']>;
  symbol_gte?: Maybe<Scalars['String']>;
  symbol_lte?: Maybe<Scalars['String']>;
  symbol_in?: Maybe<Array<Scalars['String']>>;
  symbol_not_in?: Maybe<Array<Scalars['String']>>;
  symbol_contains?: Maybe<Scalars['String']>;
  symbol_not_contains?: Maybe<Scalars['String']>;
  symbol_starts_with?: Maybe<Scalars['String']>;
  symbol_not_starts_with?: Maybe<Scalars['String']>;
  symbol_ends_with?: Maybe<Scalars['String']>;
  symbol_not_ends_with?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_gt?: Maybe<Scalars['String']>;
  name_lt?: Maybe<Scalars['String']>;
  name_gte?: Maybe<Scalars['String']>;
  name_lte?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Scalars['String']>>;
  name_not_in?: Maybe<Array<Scalars['String']>>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  decimals?: Maybe<Scalars['Int']>;
  decimals_not?: Maybe<Scalars['Int']>;
  decimals_gt?: Maybe<Scalars['Int']>;
  decimals_lt?: Maybe<Scalars['Int']>;
  decimals_gte?: Maybe<Scalars['Int']>;
  decimals_lte?: Maybe<Scalars['Int']>;
  decimals_in?: Maybe<Array<Scalars['Int']>>;
  decimals_not_in?: Maybe<Array<Scalars['Int']>>;
  priceUSD?: Maybe<Scalars['BigDecimal']>;
  priceUSD_not?: Maybe<Scalars['BigDecimal']>;
  priceUSD_gt?: Maybe<Scalars['BigDecimal']>;
  priceUSD_lt?: Maybe<Scalars['BigDecimal']>;
  priceUSD_gte?: Maybe<Scalars['BigDecimal']>;
  priceUSD_lte?: Maybe<Scalars['BigDecimal']>;
  priceUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  priceUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum Token_OrderBy {
  Id = 'id',
  Symbol = 'symbol',
  Name = 'name',
  Decimals = 'decimals',
  PriceUsd = 'priceUSD'
}

export type TokenContribution = {
  __typename?: 'TokenContribution';
  id: Scalars['ID'];
  transactionHash: Scalars['Bytes'];
  timestamp: Scalars['Int'];
  caller: Scalars['Bytes'];
  token: Token;
  amount: Scalars['BigInt'];
  credit: Scalars['BigInt'];
};

export type TokenContribution_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  transactionHash?: Maybe<Scalars['Bytes']>;
  transactionHash_not?: Maybe<Scalars['Bytes']>;
  transactionHash_in?: Maybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: Maybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: Maybe<Scalars['Bytes']>;
  transactionHash_not_contains?: Maybe<Scalars['Bytes']>;
  timestamp?: Maybe<Scalars['Int']>;
  timestamp_not?: Maybe<Scalars['Int']>;
  timestamp_gt?: Maybe<Scalars['Int']>;
  timestamp_lt?: Maybe<Scalars['Int']>;
  timestamp_gte?: Maybe<Scalars['Int']>;
  timestamp_lte?: Maybe<Scalars['Int']>;
  timestamp_in?: Maybe<Array<Scalars['Int']>>;
  timestamp_not_in?: Maybe<Array<Scalars['Int']>>;
  caller?: Maybe<Scalars['Bytes']>;
  caller_not?: Maybe<Scalars['Bytes']>;
  caller_in?: Maybe<Array<Scalars['Bytes']>>;
  caller_not_in?: Maybe<Array<Scalars['Bytes']>>;
  caller_contains?: Maybe<Scalars['Bytes']>;
  caller_not_contains?: Maybe<Scalars['Bytes']>;
  token?: Maybe<Scalars['String']>;
  token_not?: Maybe<Scalars['String']>;
  token_gt?: Maybe<Scalars['String']>;
  token_lt?: Maybe<Scalars['String']>;
  token_gte?: Maybe<Scalars['String']>;
  token_lte?: Maybe<Scalars['String']>;
  token_in?: Maybe<Array<Scalars['String']>>;
  token_not_in?: Maybe<Array<Scalars['String']>>;
  token_contains?: Maybe<Scalars['String']>;
  token_not_contains?: Maybe<Scalars['String']>;
  token_starts_with?: Maybe<Scalars['String']>;
  token_not_starts_with?: Maybe<Scalars['String']>;
  token_ends_with?: Maybe<Scalars['String']>;
  token_not_ends_with?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['BigInt']>;
  amount_not?: Maybe<Scalars['BigInt']>;
  amount_gt?: Maybe<Scalars['BigInt']>;
  amount_lt?: Maybe<Scalars['BigInt']>;
  amount_gte?: Maybe<Scalars['BigInt']>;
  amount_lte?: Maybe<Scalars['BigInt']>;
  amount_in?: Maybe<Array<Scalars['BigInt']>>;
  amount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  credit?: Maybe<Scalars['BigInt']>;
  credit_not?: Maybe<Scalars['BigInt']>;
  credit_gt?: Maybe<Scalars['BigInt']>;
  credit_lt?: Maybe<Scalars['BigInt']>;
  credit_gte?: Maybe<Scalars['BigInt']>;
  credit_lte?: Maybe<Scalars['BigInt']>;
  credit_in?: Maybe<Array<Scalars['BigInt']>>;
  credit_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum TokenContribution_OrderBy {
  Id = 'id',
  TransactionHash = 'transactionHash',
  Timestamp = 'timestamp',
  Caller = 'caller',
  Token = 'token',
  Amount = 'amount',
  Credit = 'credit'
}

export type TokenContributor = {
  __typename?: 'TokenContributor';
  id: Scalars['ID'];
  credit: Scalars['BigInt'];
};

export type TokenContributor_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  credit?: Maybe<Scalars['BigInt']>;
  credit_not?: Maybe<Scalars['BigInt']>;
  credit_gt?: Maybe<Scalars['BigInt']>;
  credit_lt?: Maybe<Scalars['BigInt']>;
  credit_gte?: Maybe<Scalars['BigInt']>;
  credit_lte?: Maybe<Scalars['BigInt']>;
  credit_in?: Maybe<Array<Scalars['BigInt']>>;
  credit_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum TokenContributor_OrderBy {
  Id = 'id',
  Credit = 'credit'
}

export type TokenForSale = {
  __typename?: 'TokenForSale';
  id: Scalars['ID'];
  tokenSeller: TokenSeller;
  token: Token;
  amount: Scalars['BigInt'];
};

export type TokenForSale_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  tokenSeller?: Maybe<Scalars['String']>;
  tokenSeller_not?: Maybe<Scalars['String']>;
  tokenSeller_gt?: Maybe<Scalars['String']>;
  tokenSeller_lt?: Maybe<Scalars['String']>;
  tokenSeller_gte?: Maybe<Scalars['String']>;
  tokenSeller_lte?: Maybe<Scalars['String']>;
  tokenSeller_in?: Maybe<Array<Scalars['String']>>;
  tokenSeller_not_in?: Maybe<Array<Scalars['String']>>;
  tokenSeller_contains?: Maybe<Scalars['String']>;
  tokenSeller_not_contains?: Maybe<Scalars['String']>;
  tokenSeller_starts_with?: Maybe<Scalars['String']>;
  tokenSeller_not_starts_with?: Maybe<Scalars['String']>;
  tokenSeller_ends_with?: Maybe<Scalars['String']>;
  tokenSeller_not_ends_with?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
  token_not?: Maybe<Scalars['String']>;
  token_gt?: Maybe<Scalars['String']>;
  token_lt?: Maybe<Scalars['String']>;
  token_gte?: Maybe<Scalars['String']>;
  token_lte?: Maybe<Scalars['String']>;
  token_in?: Maybe<Array<Scalars['String']>>;
  token_not_in?: Maybe<Array<Scalars['String']>>;
  token_contains?: Maybe<Scalars['String']>;
  token_not_contains?: Maybe<Scalars['String']>;
  token_starts_with?: Maybe<Scalars['String']>;
  token_not_starts_with?: Maybe<Scalars['String']>;
  token_ends_with?: Maybe<Scalars['String']>;
  token_not_ends_with?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['BigInt']>;
  amount_not?: Maybe<Scalars['BigInt']>;
  amount_gt?: Maybe<Scalars['BigInt']>;
  amount_lt?: Maybe<Scalars['BigInt']>;
  amount_gte?: Maybe<Scalars['BigInt']>;
  amount_lte?: Maybe<Scalars['BigInt']>;
  amount_in?: Maybe<Array<Scalars['BigInt']>>;
  amount_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum TokenForSale_OrderBy {
  Id = 'id',
  TokenSeller = 'tokenSeller',
  Token = 'token',
  Amount = 'amount'
}

export type TokenSeller = {
  __typename?: 'TokenSeller';
  id: Scalars['ID'];
  pool: IndexPool;
  premium: Scalars['Int'];
  tokensForSale?: Maybe<Array<TokenForSale>>;
};


export type TokenSellerTokensForSaleArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenForSale_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<TokenForSale_Filter>;
};

export type TokenSeller_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  pool?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  premium?: Maybe<Scalars['Int']>;
  premium_not?: Maybe<Scalars['Int']>;
  premium_gt?: Maybe<Scalars['Int']>;
  premium_lt?: Maybe<Scalars['Int']>;
  premium_gte?: Maybe<Scalars['Int']>;
  premium_lte?: Maybe<Scalars['Int']>;
  premium_in?: Maybe<Array<Scalars['Int']>>;
  premium_not_in?: Maybe<Array<Scalars['Int']>>;
};

export enum TokenSeller_OrderBy {
  Id = 'id',
  Pool = 'pool',
  Premium = 'premium',
  TokensForSale = 'tokensForSale'
}

export type Vote = {
  __typename?: 'Vote';
  id: Scalars['ID'];
  voter: Scalars['Bytes'];
  option: Scalars['Boolean'];
  weight: Scalars['BigInt'];
};

export type Vote_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  voter?: Maybe<Scalars['Bytes']>;
  voter_not?: Maybe<Scalars['Bytes']>;
  voter_in?: Maybe<Array<Scalars['Bytes']>>;
  voter_not_in?: Maybe<Array<Scalars['Bytes']>>;
  voter_contains?: Maybe<Scalars['Bytes']>;
  voter_not_contains?: Maybe<Scalars['Bytes']>;
  option?: Maybe<Scalars['Boolean']>;
  option_not?: Maybe<Scalars['Boolean']>;
  option_in?: Maybe<Array<Scalars['Boolean']>>;
  option_not_in?: Maybe<Array<Scalars['Boolean']>>;
  weight?: Maybe<Scalars['BigInt']>;
  weight_not?: Maybe<Scalars['BigInt']>;
  weight_gt?: Maybe<Scalars['BigInt']>;
  weight_lt?: Maybe<Scalars['BigInt']>;
  weight_gte?: Maybe<Scalars['BigInt']>;
  weight_lte?: Maybe<Scalars['BigInt']>;
  weight_in?: Maybe<Array<Scalars['BigInt']>>;
  weight_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum Vote_OrderBy {
  Id = 'id',
  Voter = 'voter',
  Option = 'option',
  Weight = 'weight'
}
