import type { Token } from "indexed-types";

export interface NormalizedCategory {
  id: string;
  name: string;
  symbol: string;
  brief: string;
  description: string;
  indexPools: string[];
  tokens: {
    ids: string[];
    entities: Record<string, Token>;
  };
}

export interface FormattedCategory {
  id: string;
  description: string;
  symbol: string;
  name: string;
  slug: string;
  brief?: string;
  indexPools: Array<{
    id: string;
    name: string;
    slug: string;
    symbol: string;
    size: string;
    price: string;
    supply: string;
    marketCap: string;
    swapFee: string;
    cumulativeFees: string;
    volume: string;
  }>;
  tokens: Array<{ name: string; symbol: string }>;
}

export type FormattedCategoryToken = FormattedCategory["tokens"][0];
