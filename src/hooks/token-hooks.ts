import { AppState, selectors } from "features";
import { ApprovalStatus } from "features/user/slice";
import { Pair } from "@indexed-finance/narwhal-sdk";
import {
  RegisteredCall,
  computeSushiswapPairAddress,
  computeUniswapPairAddress,
  convert,
  getRandomEntries,
  sortTokens,
} from "helpers";
import { WETH_CONTRACT_ADDRESS } from "config";
import { constants } from "ethers";
import { useAddTransactionCallback } from "./transaction-hooks";
import { useCallRegistrar } from "./use-call-registrar";
import { useCallback, useEffect, useMemo } from "react";
import { usePair, useUniswapPairs } from "./pair-hooks";
import { useSelector } from "react-redux";
import { useTokenContract } from "./contract-hooks";

// #region General
export const useToken = (tokenId: string) =>
  useSelector((state: AppState) => selectors.selectTokenById(state, tokenId));

export const useTokens = (tokenIds: string[]) =>
  useSelector((state: AppState) => selectors.selectTokensById(state, tokenIds));

export const useTokenLookup = () =>
  useSelector((state: AppState) => selectors.selectTokenLookup(state));

export const useTokenLookupBySymbol = () =>
  useSelector(selectors.selectTokenLookupBySymbol);
// #endregion

// #region Approval
interface TokenApprovalOptions {
  spender: string;
  tokenId: string;
  amount: string;
  rawAmount: string;
  symbol: string;
}

type TokenApprovalHook = {
  status: ApprovalStatus;
  approve: () => void;
};

export function useTokenApproval({
  spender,
  tokenId,
  amount,
  rawAmount,
  symbol,
}: TokenApprovalOptions): TokenApprovalHook {
  const contract = useTokenContract(tokenId);
  const addTransaction = useAddTransactionCallback();
  const status = useSelector((state: AppState) =>
    selectors.selectApprovalStatus(
      state,
      spender.toLowerCase(),
      tokenId,
      rawAmount
    )
  );
  const approve = useCallback(() => {
    if (contract && spender && status === "approval needed") {
      const approveAmount = constants.MaxUint256;
      const tx = contract.approve(
        spender,
        approveAmount// convert.toHex(convert.toBigNumber(rawAmount))
      );
      addTransaction(tx, {
        type: "ERC20.approve",
        approval: { spender, tokenAddress: tokenId, amount: approveAmount.toString() },
        summary: `Approve: ${amount} ${symbol}`,
      });
    } else {
      throw new Error();
    }
  }, [
    status,
    spender,
    amount,
    // rawAmount,
    addTransaction,
    symbol,
    contract,
    tokenId,
  ]);

  return {
    status,
    approve,
  };
}
// #endregion

// #region Price
export const TOKEN_PRICES_CALLER = "Token Prices";

export function useTokenPrice(id: string): [number, false] | [undefined, true] {
  const token = useToken(id.toLowerCase());

  usePricesRegistrar([id]);

  if (token?.priceData?.price) {
    return [token.priceData.price, false];
  }

  return [undefined, true];
}

export function useTokenPricesLessStrict(ids: string[]): number[] {
  const tokens = useTokens(ids.map((id) => id.toLowerCase()));

  usePricesRegistrar(ids);

  return useMemo(() => {
    const allPrices = tokens.map((token) => token?.priceData?.price ?? 0);
    // const loaded = !allPrices.some((p) => !p);
    return allPrices as number[];
    // if (loaded) {
    // return [allPrices as number[], false];
    // }
    // return [undefined, true];
  }, [tokens]);
}

export function useTokenPrices(
  ids: string[]
): [number[], false] | [undefined, true] {
  const tokens = useTokens(ids.map((id) => id.toLowerCase()));

  usePricesRegistrar(ids);

  return useMemo(() => {
    const allPrices = tokens.map((token) => token?.priceData?.price);
    const loaded = !allPrices.some((p) => !p);
    if (loaded) {
      return [allPrices as number[], false];
    }
    return [undefined, true];
  }, [tokens]);
}

const isToken0 = (pair: Pair, token: string) =>
  pair.token0.address.toLowerCase() === token.toLowerCase();

const getLpTokenPrice = (
  pair: Pair,
  lpSupply: string,
  pricedToken: string,
  price: number
) => {
  const totalSupply = parseFloat(
    convert.toBalance(convert.toBigNumber(lpSupply), 18, false)
  );
  const halfReserves = isToken0(pair, pricedToken)
    ? pair.reserve0.toExact()
    : pair.reserve1.toExact();
  return (price * parseFloat(halfReserves) * 2) / totalSupply;
};

export const last = <T>(arr: T[]): T => arr[arr.length - 1];

export type PricedAsset = {
  /**
   * @param id - ID of the token to look up the price for if
   * `useEthLpTokenPrice` is false, or the ID of the base token
   * if `useEthLpTokenPrice` is true.
   */
  id: string;
  /**
   * @param useEthLpTokenPrice - Boolean indicating whether to
   * query the price for the base token or the price of the LP
   * token for the base token's UNIV2 ETH pair.
   * If `true`, the resulting map will have the pair ID as the
   * key instead of the base token.
   * The reason we do it this way is to avoid a type-union here
   * where the caller might need to provide token0 and token1.
   */
  useEthLpTokenPrice: boolean;
  sushiswap?: boolean;
};

export function useTokenPricesLookup(
  tokens: PricedAsset[]
): Record<string, number> {
  const [baseTokenIds, pairTokens, pairTokenIds] = useMemo(() => {
    const baseTokenIds = [
      ...tokens.filter((t) => !t.useEthLpTokenPrice).map((t) => t.id),
      WETH_CONTRACT_ADDRESS,
    ];
    const pairTokens = tokens
      .filter((t) => t.useEthLpTokenPrice)
      .map((token) => {
        const [token0, token1] = sortTokens(token.id, WETH_CONTRACT_ADDRESS);
        const id = token.sushiswap
          ? computeSushiswapPairAddress(token0, token1).toLowerCase()
          : computeUniswapPairAddress(token0, token1).toLowerCase();
        return {
          id,
          token0,
          token1,
          sushiswap: token.sushiswap,
          exists: undefined,
        };
      });
    if (pairTokens.length) {
      baseTokenIds.push(WETH_CONTRACT_ADDRESS);
    }
    return [baseTokenIds, pairTokens, pairTokens.map((p) => p.id)];
  }, [tokens]);
  // const [baseTokenPrices, baseTokenPricesLoading] = useTokenPrices(
  //   baseTokenIds
  // );
  const baseTokenPrices = useTokenPricesLessStrict(baseTokenIds);
  // @todo only lookup supplies if we know the pair actually exists
  const [supplies, suppliesLoading] =
    useTotalSuppliesWithLoadingIndicator(pairTokenIds);
  const [pairs, pairsLoading] = useUniswapPairs(pairTokens);

  return useMemo(() => {
    const priceMap: Record<string, number> = {};
    // if (!baseTokenPricesLoading) {
    for (const i in baseTokenIds) {
      priceMap[baseTokenIds[i]] = (baseTokenPrices as number[])[i] || 0;
    }
    if (pairTokens.length && !suppliesLoading && !pairsLoading) {
      for (const i in pairTokenIds) {
        const ethPrice = last(baseTokenPrices as number[]);
        const id = pairTokenIds[i].toLowerCase();
        const supply = (supplies as string[])[i];
        // This might not be at the same index if any of the pairs don't exist
        const pair = (pairs as Pair[]).find(
          (p) => p.liquidityToken.address.toLowerCase() === id
        );
        if (pair) {
          priceMap[id] = getLpTokenPrice(
            pair,
            supply,
            WETH_CONTRACT_ADDRESS,
            ethPrice
          );
        }
      }
    }
    return priceMap;
  }, [
    baseTokenIds,
    pairTokenIds,
    pairTokens,
    baseTokenPrices,
    // baseTokenPricesLoading,
    supplies,
    suppliesLoading,
    pairs,
    pairsLoading,
  ]);
}

export function usePairTokenPrice(id: string) {
  const pairInfo = usePair(id);
  const [
    pairArr,
    supplyArr,
    pricedTokenId
  ] = useMemo(() => {
    if (!pairInfo) return [[], [], ''];
    const { id, exists, token0, token1, sushiswap } = pairInfo;
    if (!token0 || !token1) return [[], [], ''];
    let pricedTokenId: string;
    if (token0.toLowerCase() === WETH_CONTRACT_ADDRESS.toLowerCase()) {
      pricedTokenId = token0.toLowerCase();
    } else {
      pricedTokenId = token1.toLowerCase();
    }
    return [
      [{ id, exists, token0, token1, sushiswap }] ,
      [id],
      pricedTokenId
    ]
  }, [pairInfo]);

  const [tokenPrice, tokenPriceLoading] = useTokenPrice(pricedTokenId);
  const [pairs, pairsLoading] = useUniswapPairs(pairArr);
  const [supplies, suppliesLoading] = useTotalSuppliesWithLoadingIndicator(supplyArr);

  return useMemo(() => {
    // console.log(`PRICE LOADING ${tokenPriceLoading} ${tokenPrice}`);
    // console.log(`SUPPLIES LOADING ${suppliesLoading} ${supplies}`);
    if (pairsLoading || tokenPriceLoading || suppliesLoading) {
      return 0;
    }
    const [pair] = pairs || [];
    const [supply] = supplies || [];
    const priceZero = pair.token0.address.toLowerCase() === pricedTokenId.toLowerCase();
    const tokenReserve = priceZero
      ? pair.reserve0
      : pair.reserve1;
    const valueOfSupplyInToken = parseFloat(tokenReserve.toExact()) * 2;
    const tokensPerLpToken =
      valueOfSupplyInToken /
      parseFloat(convert.toBalance(supply, 18, false));
    return tokensPerLpToken * (tokenPrice as number);
  }, [tokenPrice, tokenPriceLoading, pairs, pairsLoading, supplies, suppliesLoading, pricedTokenId])
}

export const useEthPrice = () => useTokenPrice(WETH_CONTRACT_ADDRESS);

export function usePricesRegistrar(tokenIds: string[]) {
  useCallRegistrar({
    caller: TOKEN_PRICES_CALLER.concat("1"),
    onChainCalls: [],
    offChainCalls: [
      {
        target: "",
        function: "fetchTokenPriceData",
        args: tokenIds,
        canBeMerged: true,
      },
    ],
  });
}
// #endregion

// #region Total Supplies
export const TOTAL_SUPPLIES_CALLER = "Total Supplies";

export function createTotalSuppliesCalls(tokenIds: string[]): RegisteredCall[] {
  return tokenIds.map((id) => ({
    // caller: TOTAL_SUPPLIES_CALLER,
    interfaceKind: "IERC20",
    target: id,
    function: "totalSupply",
  }));
}

export function useTotalSuppliesRegistrar(tokenIds: string[]) {
  useCallRegistrar({
    caller: TOTAL_SUPPLIES_CALLER,
    onChainCalls: createTotalSuppliesCalls(tokenIds),
  });
}

export function useTotalSuppliesWithLoadingIndicator(
  tokens: string[]
): [string[], false] | [undefined, true] {
  const supplies = useSelector((state: AppState) =>
    selectors.selectTokenSupplies(state, tokens)
  );

  useTotalSuppliesRegistrar(tokens);

  return supplies.every(Boolean)
    ? [supplies as string[], false]
    : [undefined, true];
}
// #endregion

// #region Randomizer
type Asset = { name: string; symbol: string; id: string };

export type TokenRandomizerOptions = {
  assets: Asset[];
  from?: string;
  to: string;
  defaultInputSymbol?: string;
  defaultOutputSymbol?: string;
  changeFrom?(symbol: string): void;
  changeTo(symbol: string): void;
  callback?(): void;
};

export function useTokenRandomizer(options: TokenRandomizerOptions) {
  useEffect(() => {
    if (options.assets) {
      const { assets: tokens } = options;

      if (options.hasOwnProperty("from")) {
        if (!options.from && !options.to && tokens.length > 1) {
          const fromToken =
            options.defaultInputSymbol ?? getRandomEntries(1, tokens)[0].symbol;
          const toToken =
            options.defaultOutputSymbol ??
            getRandomEntries(
              1,
              tokens.filter((t) => t.symbol !== fromToken)
            )[0].symbol;

          if (options.changeFrom) {
            options.changeFrom(fromToken);
          }

          options.changeTo(toToken);

          if (options.callback) {
            options.callback();
          }
        }
      } else {
        if (!options.to && tokens.length > 0) {
          const [toToken] = getRandomEntries(1, tokens);

          options.changeTo(toToken.symbol);

          if (options.callback) {
            options.callback();
          }
        }
      }
    }
  }, [options]);
}
// #endregion
