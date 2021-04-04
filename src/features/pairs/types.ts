import type { NormalizedToken } from "../tokens";

export interface NormalizedPairSide {
  token: string;
  reserves: string;
}

export interface PairReservesUpdate {
  id: string; // Uniswap pair address
  exists: boolean;
  reserves0: string;
  reserves1: string;
}

export interface NormalizedPair {
  id: string; // Uniswap pair address
  exists?: boolean;
  token0?: string;
  token1?: string;
  reserves0?: string;
  reserves1?: string;
}

export interface FormattedPair {
  id: string;
  exists: boolean;
  token0: NormalizedToken;
  token1: NormalizedToken;
  reserves0: string;
  reserves1: string;
}
