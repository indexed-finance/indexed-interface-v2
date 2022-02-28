import { AppState, selectors, useSigner } from "features";
import { BigNumber } from "ethereum";
import { COMMON_BASE_TOKENS, NATIVE_TOKEN_WRAPPER, NATIVE_TOKEN_WRAPPER_ADDRESS, SLIPPAGE_RATE, WETH_ADDRESS } from "config";
import { Currency, Trade } from "@indexed-finance/narwhal-sdk";
import {
  _calcAllInGivenPoolOut,
  calcPoolOutGivenSingleIn,
  calcSingleInGivenPoolOut,
  downwardSlippage,
  upwardSlippage,
} from "ethereum";
import { constants } from "ethers";
import { convert } from "helpers";
import { getTokenValueGetter, useUniswapTradingPairs } from "./pair-hooks";
import { useCallback, useMemo } from "react";
import { useChainId, useGasPrice } from "./settings-hooks";
import { useCommonBaseTokens, useTokenLookupBySymbol, useTotalSuppliesWithLoadingIndicator } from "./token-hooks";
import { useIndexedNarwhalRouterContract } from "./contract-hooks";
import {
  useMintMultiTransactionCallback,
  useMintSingleTransactionCallbacks,
  useRoutedMintTransactionCallbacks,
} from "./transaction-hooks";
import { usePoolTokenAddresses, usePoolUnderlyingTokens } from "./pool-hooks";
import { useSelector } from "react-redux";

// #region Token
export function useSingleTokenMintCallbacks(poolId: string) {
  const signer = useSigner();
  const pool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const { joinswapExternAmountIn, joinswapPoolAmountOut } =
    useMintSingleTransactionCallbacks(poolId);
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const calculateAmountIn = useCallback(
    (tokenInSymbol: string, amountOut: BigNumber) => {
      if (pool) {
        const inputToken =
          pool.tokens.entities[
            tokenLookup[tokenInSymbol.toLowerCase()].id.toLowerCase()
          ];
        if (inputToken) {
          const tokenIn = inputToken.token.id;

          const result = calcSingleInGivenPoolOut(pool, inputToken, amountOut);
          return {
            tokenIn,
            amountOut,
            ...result,
          };
        }
      }
      return null;
    },
    [pool, tokenLookup]
  );
  const calculateAmountOut = useCallback(
    (tokenInSymbol: string, amountIn: BigNumber) => {
      if (pool) {
        const inputToken =
          pool.tokens.entities[
            tokenLookup[tokenInSymbol.toLowerCase()].id.toLowerCase()
          ];

        if (inputToken) {
          const tokenIn = inputToken.token.id;
          const result = calcPoolOutGivenSingleIn(pool, inputToken, amountIn);

          return {
            tokenIn,
            amountIn,
            ...result,
          };
        }
      }
      return null;
    },
    [pool, tokenLookup]
  );
  const executeMint = useCallback(
    (
      tokenInSymbol: string,
      specifiedField: "from" | "to",
      amount: BigNumber
    ) => {
      if (signer) {
        if (specifiedField === "from") {
          const result = calculateAmountOut(tokenInSymbol, amount);

          if (result && !result.error) {
            joinswapExternAmountIn(
              result.tokenIn,
              result.amountIn,
              downwardSlippage(result.poolAmountOut as BigNumber, SLIPPAGE_RATE)
            );
          } else {
            Promise.reject();
          }
        } else {
          const result = calculateAmountIn(tokenInSymbol, amount);

          if (result && !result.error) {
            joinswapPoolAmountOut(
              result.tokenIn,
              result.amountOut,
              upwardSlippage(result.tokenAmountIn as BigNumber, SLIPPAGE_RATE)
            );
          } else {
            Promise.reject();
          }
        }
      } else {
        return Promise.reject();
      }
    },
    [
      signer,
      calculateAmountIn,
      calculateAmountOut,
      joinswapExternAmountIn,
      joinswapPoolAmountOut,
    ]
  );

  return {
    calculateAmountIn,
    calculateAmountOut,
    executeMint,
  };
}

export function useMultiTokenMintCallbacks(poolId: string) {
  const pool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const joinPool = useMintMultiTransactionCallback(poolId);
  const calculateAmountsIn = useCallback(
    (typedAmountOut: string) => {
      if (pool) {
        const balances = pool.tokensList.map(
          (token) => pool.tokens.entities[token].balance
        );
        const totalSupply = pool.totalSupply;
        const poolAmountOut = convert.toToken(typedAmountOut, 18);

        return {
          tokens: [...pool.tokensList], // Simplify the form's token lookup to convert amounts to strings
          amountsIn: _calcAllInGivenPoolOut(
            balances,
            convert.toBigNumber(totalSupply),
            poolAmountOut
          ),
          poolAmountOut,
        };
      }
    },
    [pool]
  );
  const executeMint = useCallback(
    (typedAmountOut: string) => {
      const result = calculateAmountsIn(typedAmountOut);
      if (result) {
        joinPool(
          result.poolAmountOut,
          result.amountsIn.map((amount) =>
            upwardSlippage(amount, SLIPPAGE_RATE)
          )
        );
      } else {
        Promise.reject();
      }
    },
    [joinPool, calculateAmountsIn]
  );

  return { calculateAmountsIn, executeMint };
}
// #endregion

type RoutedMintResultSingle = {
  type: 'Single';
  poolResult: {
    error?: string | undefined;
    tokenAmountIn: BigNumber;
    tokenIn: string;
    amountOut: BigNumber;
  };
  uniswapResult: Trade;
  gasEstimate: number;
};

type RoutedMintResultMulti = {
  type: 'Multi'
  tokenIn: string;
  maxAmountIn: BigNumber;
  intermediaries: string[];
  gasEstimate: number;
}

function encodeIntermediary(token: string, sushiPrevious: boolean, sushiNext: boolean) {
  return [
    `0x${'00'.repeat(10)}`,
    sushiPrevious ? '01' : '00',
    token.slice(2).padStart(40, '0'),
    sushiNext ? '01' : '00'
  ].join('');
}

export function useMintRouterCallbacks(poolId: string) {
  const chainId = useChainId()
  const baseTokens = useCommonBaseTokens()
  const poolTokens = usePoolUnderlyingTokens(poolId);
  const poolTokenIds = usePoolTokenAddresses(poolId);
  const arr = useMemo(() => [poolId], [poolId]);
  const [poolSupply, loadingSupply] = useTotalSuppliesWithLoadingIndicator(arr)
  const tokenLookupBySymbol = useTokenLookupBySymbol();
  const gasPrice = useGasPrice()
  const tokenIds = useMemo(
    () => [...poolTokenIds, ...baseTokens.map(({ id }) => id)],
    [poolTokenIds, baseTokens]
  );
  const { mintSingleExactAmountOut, mintMultiExactAmountOut } =
    useRoutedMintTransactionCallbacks(poolId);
  const { calculateAmountIn } = useSingleTokenMintCallbacks(poolId);
  const {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput,
    loading,
  } = useUniswapTradingPairs(tokenIds);
  const { calculateAmountsIn } = useMultiTokenMintCallbacks(poolId);
  const getBestMintRouteForAmountOutMulti = useCallback(
    (tokenInSymbol: string, amountOut: BigNumber): RoutedMintResultMulti | null => {
      if (loading) return null;
      const result = calculateAmountsIn(convert.toBalance(amountOut, 18, false, 18));
      if (!result) return null;
      const normalizedInput = tokenLookupBySymbol[tokenInSymbol.toLowerCase()];
      const { tokens, amountsIn } = result;
      let totalAmountIn: BigNumber = convert.toBigNumber("0");
      const intermediaries: string[] = [];
      console.log(`MULTI: TOKENS LIST`);
      console.log(tokens)
      /* const uniswapResults =  */tokens.map((tokenAddress, i) => {
        const token = poolTokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
        if (!token) return null;
        const normalizedOutput = tokenLookupBySymbol[token.token.symbol.toLowerCase()];
        if (normalizedInput.id === normalizedOutput.id) {
          intermediaries.push(constants.AddressZero + "00".repeat(12))
          return null
        }
        const weth = WETH_ADDRESS[chainId];
        const wnative = NATIVE_TOKEN_WRAPPER_ADDRESS[chainId];

        const uniswapResult = calculateBestTradeForExactOutput(
          normalizedInput,
          normalizedOutput,
          amountsIn[i],
          {
            maxHops: 2,
            maxNumResults: 1,
            tokenPairSubset: [
              [token.address, weth],
              [normalizedInput.id, weth],
              [normalizedInput.id, token.address],
              ...(weth !== wnative ? [
                [token.address, wnative],
                [weth, wnative],
                [normalizedInput.id, wnative]
              ] : [])
            ]
          }
        );
        if (!uniswapResult) return null;
        totalAmountIn = totalAmountIn.plus(convert.toBigNumber(uniswapResult.inputAmount.raw.toString()));
        const path = uniswapResult.route.encodedPath;
        console.log(`MULTI: ANY PAIRS USING SUSHI? ${uniswapResult.route.pairs.some((p) => p.sushi)}`)
        const sushiFirst = uniswapResult.route.pairs[0].sushi;
        const [address, sushiNext] = path.length === 3
          ? [uniswapResult.route.path[1].address, uniswapResult.route.pairs[1].sushi]
          : [constants.AddressZero, false]
        intermediaries.push(encodeIntermediary(address, sushiFirst, sushiNext))
      });
      if (intermediaries.length !== tokens.length) return null;
      
      return {
        type: 'Multi',
        tokenIn: normalizedInput.id,
        intermediaries,
        maxAmountIn: upwardSlippage(totalAmountIn, SLIPPAGE_RATE),
        gasEstimate: 220000 * tokens.length
      }
    },
    [
      calculateAmountsIn,
      loading,
      tokenLookupBySymbol,
      calculateBestTradeForExactOutput,
      poolTokens,
      chainId
    ]
  )
  const totalSupply = useMemo(() => {
    if (loadingSupply) return convert.toBigNumber("0");
    return convert.toBigNumber((poolSupply as string[])[0])
  }, [poolSupply, loadingSupply]);
  const getBestMintRouteForAmountOutSingle = useCallback(
    (tokenInSymbol: string, amountOut: BigNumber): RoutedMintResultSingle | null => {
      if (loading || !totalSupply) {
        console.log(`LOADING ${loading} totalSupply ${totalSupply.toString()}`)
        return null;
      }
      
      const normalizedInput = tokenLookupBySymbol[tokenInSymbol.toLowerCase()];
      const poolRatio = amountOut.div(totalSupply).toNumber();
      const allResults = poolTokens
        .map((token) => {
          const maxPoolRatio = convert.toBalanceNumber(token.usedWeight, 18);
          console.log(`Calculating input for ${token.token.symbol}: Weight: ${token.usedWeight} : Max poolRatio ${maxPoolRatio}`);
          if (poolRatio > maxPoolRatio) return null;
          const normalizedOutput =
            tokenLookupBySymbol[token.token.symbol.toLowerCase()];
          if (!normalizedOutput) return null;
          const poolResult = calculateAmountIn(
            normalizedOutput.symbol,
            amountOut
          );
          if (poolResult) {
            if (poolResult.error) {
              return { poolResult };
            }
            if (poolResult.tokenAmountIn) {
              const uniswapResult = calculateBestTradeForExactOutput(
                normalizedInput,
                normalizedOutput,
                poolResult.tokenAmountIn,
                { maxHops: 2, maxNumResults: 1 }
              );
              if (uniswapResult) {
                return {
                  type: "Single",
                  poolResult,
                  uniswapResult,
                  gasEstimate: 300000
                };
              }
            }
          }
          return null;
        })
        .filter((_) => _) as Array<RoutedMintResultSingle>;
      allResults.sort((a, b) => {
        const inputA = a.uniswapResult?.inputAmount;
        const inputB = b.uniswapResult?.inputAmount || "0";
        if (!inputA) return -1;
        return inputA.greaterThan(inputB) ? 1 : -1
      });
      const bestResult = allResults[0];
      return bestResult;
    },
    [
      loading,
      totalSupply,
      tokenLookupBySymbol,
      poolTokens,
      calculateAmountIn,
      calculateBestTradeForExactOutput,
    ]
  );

  const getBestMintRouteForAmountOut = useCallback(
    async (tokenInSymbol: string, amountOut: BigNumber) => {
      console.log(`getBestMintRouteForAmountOut: ${tokenInSymbol} input for ${convert.toBalance(amountOut, 18)} pool tokens`)
      const normalizedInput = tokenLookupBySymbol[tokenInSymbol.toLowerCase()];
      if (!normalizedInput) return null;
      const bestSingle = getBestMintRouteForAmountOutSingle(tokenInSymbol, amountOut);
      const bestMulti = getBestMintRouteForAmountOutMulti(tokenInSymbol, amountOut);
      console.log(`Got best multi ${!!bestMulti} | Got best single ${!!bestSingle}`)
      if (!bestSingle || bestSingle.poolResult.error || !bestSingle.uniswapResult) return bestMulti;
      if (!bestMulti) return bestSingle;
      const inputSingle = upwardSlippage(convert.toBigNumber(bestSingle.uniswapResult.inputAmount.raw.toString(10)), SLIPPAGE_RATE)
      const calculateValueInToken = getTokenValueGetter(calculateBestTradeForExactInput, NATIVE_TOKEN_WRAPPER[chainId], normalizedInput);
      const gasCostValueSingle = calculateValueInToken(bestSingle.gasEstimate * gasPrice)
      const gasCostValueMulti = calculateValueInToken(bestMulti.gasEstimate * gasPrice)
      const singleTotalCost = gasCostValueSingle.plus(inputSingle);
      const multiTotalCost = gasCostValueMulti.plus(bestMulti.maxAmountIn)
      console.log(`Single Total Cost: ${convert.toBalance(singleTotalCost, normalizedInput.decimals)} | Gas Value In Token: ${convert.toBalance(gasCostValueSingle, normalizedInput.decimals)} (${gasPrice} * ${bestSingle.gasEstimate})`)
      console.log(`Multi Total Cost:${convert.toBalance(multiTotalCost, normalizedInput.decimals)} | Gas Value In Token: ${convert.toBalance(gasCostValueMulti, normalizedInput.decimals)} (${gasPrice} * ${bestMulti.gasEstimate})`)
      if (singleTotalCost.lt(multiTotalCost)) return bestSingle;
      return bestMulti
    },
    [
      getBestMintRouteForAmountOutMulti,
      getBestMintRouteForAmountOutSingle,
      tokenLookupBySymbol,
      calculateBestTradeForExactInput,
      gasPrice,
      chainId,
    ]
  );
  const executeRoutedMint = useCallback(
    async (
      tokenInSymbol: string,
      amountOut: BigNumber
    ) => {
      const result = await getBestMintRouteForAmountOut(tokenInSymbol, amountOut);
      if (result) {
        if (result.type === "Multi") {
          return mintMultiExactAmountOut(result.intermediaries, amountOut, result.tokenIn, result.maxAmountIn, result.tokenIn === constants.AddressZero)
        } else {
          return mintSingleExactAmountOut(
            upwardSlippage(
              convert.toBigNumber(
                result.uniswapResult.inputAmount.raw.toString(10)
              ),
              SLIPPAGE_RATE
            ),
            result.uniswapResult.route.encodedPath,
            amountOut,
            result.uniswapResult.inputAmount.currency === Currency.ETHER
          )
        }
      }
      return Promise.reject();
    },
    [
      getBestMintRouteForAmountOut,
      mintMultiExactAmountOut,
      mintSingleExactAmountOut,
    ]
  );

  return {
    executeRoutedMint,
    getBestMintRouteForAmountOut,
    loading
  } 
}