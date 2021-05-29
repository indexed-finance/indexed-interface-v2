import { DEFAULT_DECIMAL_COUNT } from "config";
import { adapter } from "./slice";
import { categoriesSelectors } from "features/categories";
import { convert } from "helpers";
import { createSelector } from "reselect";
import { tokensSelectors } from "../tokens";
import S from "string";
import type { AppState } from "../store";
import type { NormalizedIndexPool } from "./types";

function formatName(from = "") {
  return S(from).camelize().s.toLowerCase();
}

const selectors = adapter.getSelectors((state: AppState) => state.indexPools);

const selectAllPools = (state: AppState) => selectors.selectAll(state);

const selectPool = (state: AppState, poolId: string) =>
  selectors.selectById(state, poolId);

const selectAllPoolIds = (state: AppState) => selectors.selectIds(state);

const selectNameForPool = (state: AppState, poolId: string) => {
  const pool = selectPool(state, poolId);
  return pool ? formatName(pool.name) : "";
};

const selectPoolLookUpByName = createSelector(
  [selectAllPools],
  (indexPools) => {
    return indexPools.reduce((prev, next) => {
      prev[formatName(next.name)] = next;
      return prev;
    }, {} as Record<string, NormalizedIndexPool>);
  }
);

/**
 * @returns undefined if no pools are loaded yet;
 * pool ID if a pool is found for the provided name;
 * empty string if no pool is found for the provided name
 */
const selectPoolIdByName = (state: AppState, name: string) => {
  const poolsByName = selectPoolLookUpByName(state);
  const formattedName = formatName(name);
  const pool = poolsByName[formattedName];

  if (pool) {
    return pool.id ?? "";
  }
};

const selectPoolByName = (state: AppState, name: string) => {
  const poolsByName = selectPoolLookUpByName(state);
  const formattedName = formatName(name);

  return poolsByName[formattedName] ?? null;
};

const selectPoolLookup = (state: AppState) => selectors.selectEntities(state);

const selectPoolTokenIds = (state: AppState, poolId: string) => {
  const pool = selectPool(state, poolId);
  return pool?.tokens.ids ?? [];
};

const selectPoolTokenSymbols = (state: AppState, poolId: string) => {
  const tokenIds = selectPoolTokenIds(state, poolId);
  const tokenLookup = tokensSelectors.selectTokenLookup(state);
  const symbols = tokenIds.map((id) => tokenLookup[id]?.symbol ?? "");

  return symbols;
};

const selectSwapFee = (state: AppState, poolId: string) => {
  const pool = selectPool(state, poolId);
  return pool ? convert.toBigNumber(pool.swapFee) : null;
};

const selectFormattedSwapFee = (state: AppState, poolId: string) => {
  const fee = selectSwapFee(state, poolId);

  return fee ? convert.toPercent(parseFloat(convert.toBalance(fee))) : "";
};

const selectPoolInitializerAddress = (state: AppState, poolId: string) => {
  const pool = selectPool(state, poolId);
  return pool?.poolInitializer?.id ?? null;
};

const selectCategoryImage = (state: AppState, poolId: string) => {
  const pool = selectPool(state, poolId);

  if (pool) {
    const { id } = pool.category;
    const categoryLookup = categoriesSelectors.selectCategoryLookup(state);
    const category = categoryLookup[id];

    return category?.symbol ?? "";
  } else {
    return "";
  }
};

const selectCategoryImagesByPoolIds = (state: AppState) =>
  selectAllPools(state)
    .map((pool) => ({
      id: pool.id,
      image: selectCategoryImage(state, pool.id),
    }))
    .reduce((prev, next) => {
      prev[next.id] = next.image;
      return prev;
    }, {} as Record<string, string>);

const selectPoolTokenEntities = (state: AppState, poolId: string) =>
  state.indexPools.entities[poolId.toLowerCase()]?.tokens.entities;

const selectPoolUnderlyingTokens = createSelector(
  [selectPoolTokenEntities],
  (tokens) => (tokens ? Object.values(tokens) : [])
);

const selectPoolTokenAddresses = (state: AppState, poolId: string) =>
  state.indexPools.entities[poolId.toString()]?.tokens.ids ?? [];

const selectTokenWeights = (
  state: AppState,
  poolId: string,
  tokenIds: string[]
) => {
  const pool = selectPool(state, poolId);
  const weights = tokenIds.reduce((prev, next) => {
    prev[next] = "";
    return prev;
  }, {} as Record<string, string>);

  try {
    if (pool) {
      for (const tokenId of tokenIds) {
        const denorm = convert.toBigNumber(
          pool.tokens.entities[tokenId].denorm
        );
        const totalWeight = convert.toBigNumber(pool.totalWeight);
        const prescaled = denorm.dividedBy(totalWeight);
        const scalePower = convert.toBigNumber(
          DEFAULT_DECIMAL_COUNT.toString()
        );
        const scaleMultiplier = convert.toBigNumber("10").pow(scalePower);
        const weight = prescaled.multipliedBy(scaleMultiplier);

        weights[tokenId] = weight.toString();
      }
    }
  } catch {}

  return weights;
};

const selectNormalizedUnderlyingPoolTokens = (
  state: AppState,
  poolId: string
) => {
  const tokenIds = selectPoolTokenAddresses(state, poolId);
  return tokensSelectors.selectTokensById(state, tokenIds);
};

const selectPoolBySymbol = (state: AppState, symbol: string) => {
  const pools = selectAllPools(state);
  return pools.find((pool) => pool.symbol === symbol) ?? null;
};

const selectPoolCount = (state: AppState) => state.indexPools.ids.length;

export const indexPoolsSelectors = {
  selectAllPools,
  selectPool,
  selectAllPoolIds,
  selectNameForPool,
  selectPoolLookUpByName,
  selectPoolIdByName,
  selectPoolByName,
  selectPoolLookup,
  selectPoolTokenIds,
  selectPoolTokenSymbols,
  selectSwapFee,
  selectFormattedSwapFee,
  selectPoolInitializerAddress,
  selectCategoryImage,
  selectCategoryImagesByPoolIds,
  selectPoolUnderlyingTokens,
  selectPoolTokenAddresses,
  selectTokenWeights,
  selectNormalizedUnderlyingPoolTokens,
  selectPoolBySymbol,
  selectPoolCount,
};
