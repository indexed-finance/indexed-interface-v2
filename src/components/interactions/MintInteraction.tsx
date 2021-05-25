import { COMMON_BASE_TOKENS, MINT_ROUTER_ADDRESS, SLIPPAGE_RATE } from "config";
import { FormattedIndexPool, selectors } from "features";
import {
  MultiInteraction,
  MultiInteractionValues,
  SingleInteraction,
  SingleInteractionValues,
} from "./BaseInteraction";
import { convert } from "helpers";
import { downwardSlippage, upwardSlippage } from "ethereum";
import {
  useBalanceAndApprovalRegistrar,
  useMintRouterCallbacks,
  useMultiTokenMintCallbacks,
  usePoolTokenAddresses,
  useSingleTokenMintCallbacks,
} from "hooks";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";

interface Props {
  indexPool: FormattedIndexPool;
  uniswap?: boolean;
  multi?: boolean;
}

export function MintInteraction({ indexPool, uniswap, multi }: Props) {
  if (uniswap) {
    return <UniswapMintInteraction indexPool={indexPool} />;
  } else if (multi) {
    return <MultiTokenMintInteraction indexPool={indexPool} />;
  } else {
    return <SingleTokenMintInteraction indexPool={indexPool} />;
  }
}

function SingleTokenMintInteraction({ indexPool }: Props) {
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const {
    calculateAmountIn,
    calculateAmountOut,
    executeMint,
  } = useSingleTokenMintCallbacks(indexPool.id);
  const handleChange = useCallback(
    (values: SingleInteractionValues) => {
      const {
        fromToken,
        fromAmount,
        toToken,
        toAmount,
        lastTouchedField,
      } = values;

      if (!toToken || !fromToken) {
        return;
      }
      if (lastTouchedField === "from") {
        if (!fromAmount || isNaN(fromAmount) || fromAmount < 0) {
          values.fromAmount = 0;
          values.toAmount = 0;
          return;
        }
        const output = calculateAmountOut(fromToken, fromAmount.toString());
        if (output) {
          if (output.error) {
            return output.error;
          } else {
            const { decimals } = tokenLookup[toToken.toLowerCase()];
            values.toAmount = parseFloat(
              convert.toBalance(
                downwardSlippage(
                  output.poolAmountOut as BigNumber,
                  SLIPPAGE_RATE
                ),
                decimals
              )
            );
          }
        }
      } else {
        if (!toAmount || isNaN(toAmount) || toAmount < 0) {
          values.fromAmount = 0;
          values.toAmount = 0;
          return;
        }

        const input = calculateAmountIn(fromToken, toAmount.toString());
        if (input) {
          if (input.error) {
            return input.error;
          } else {
            const { decimals } = tokenLookup[fromToken.toLowerCase()];
            values.fromAmount = parseFloat(
              convert.toBalance(
                upwardSlippage(input.tokenAmountIn as BigNumber, SLIPPAGE_RATE),
                decimals
              )
            );
          }
        }
      }
    },
    [calculateAmountIn, calculateAmountOut, tokenLookup]
  );
  const handleSubmit = useCallback(
    (values: SingleInteractionValues) => {
      const {
        fromToken,
        fromAmount,
        toToken,
        toAmount,
        lastTouchedField,
      } = values;
      if (fromAmount > 0 && toAmount > 0 && fromToken && toToken) {
        executeMint(
          fromToken,
          lastTouchedField,
          lastTouchedField === "from"
            ? fromAmount.toString()
            : toAmount.toString()
        );
      }
    },
    [executeMint]
  );
  const tokenIds = usePoolTokenAddresses(indexPool.id);

  useBalanceAndApprovalRegistrar(indexPool.id, tokenIds);

  return (
    <SingleInteraction
      assets={indexPool.assets}
      spender={indexPool.id}
      onSubmit={handleSubmit}
      onChange={handleChange}
      defaultOutputSymbol={indexPool.symbol}
      disableOutputSelect
    />
  );
}

function UniswapMintInteraction({ indexPool }: Props) {
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);

  useBalanceAndApprovalRegistrar(MINT_ROUTER_ADDRESS.toLowerCase(), [
    ...COMMON_BASE_TOKENS.map(({ id }) => id),
  ]);
  const {
    getBestMintRouteForAmountIn,
    getBestMintRouteForAmountOut,
    executeRoutedMint,
  } = useMintRouterCallbacks(indexPool.id);

  const assets = [...COMMON_BASE_TOKENS];

  const handleChange = useCallback(
    (values: SingleInteractionValues) => {
      const {
        fromToken,
        fromAmount,
        toToken,
        toAmount,
        lastTouchedField,
      } = values;
      if (!toToken || !fromToken) {
        return;
      }
      if (lastTouchedField === "from") {
        if (!fromAmount || isNaN(fromAmount) || fromAmount < 0) {
          values.fromAmount = 0;
          values.toAmount = 0;
          return;
        }
        const result = getBestMintRouteForAmountIn(
          fromToken,
          fromAmount.toString()
        );
        if (result) {
          if (result.poolResult?.error) {
            return result.poolResult.error;
          } else {
            const { decimals } = tokenLookup[toToken.toLowerCase()];
            values.toAmount = parseFloat(
              convert.toBalance(
                downwardSlippage(
                  result.poolResult.poolAmountOut as BigNumber,
                  SLIPPAGE_RATE
                ),
                decimals
              )
            );
          }
        }
      } else {
        if (!toAmount || isNaN(toAmount) || toAmount < 0) {
          values.fromAmount = 0;
          values.toAmount = 0;
          return;
        }

        const result = getBestMintRouteForAmountOut(
          fromToken,
          toAmount.toString()
        );
        if (result) {
          if (result.poolResult?.error) {
            return result.poolResult.error;
          } else {
            const { decimals } = tokenLookup[fromToken.toLowerCase()];
            values.fromAmount = parseFloat(
              convert.toBalance(
                upwardSlippage(
                  convert.toBigNumber(
                    result.uniswapResult.inputAmount.raw.toString(10)
                  ),
                  SLIPPAGE_RATE
                ),
                decimals
              )
            );
          }
        }
      }
    },
    [getBestMintRouteForAmountIn, getBestMintRouteForAmountOut, tokenLookup]
  );

  const handleSubmit = useCallback(
    (values: SingleInteractionValues) => {
      const {
        fromToken,
        fromAmount,
        toToken,
        toAmount,
        lastTouchedField,
      } = values;
      if (fromAmount > 0 && toAmount > 0 && fromToken && toToken) {
        executeRoutedMint(
          fromToken,
          lastTouchedField,
          lastTouchedField === "from"
            ? fromAmount.toString()
            : toAmount.toString()
        );
      }
    },
    [executeRoutedMint]
  );

  return (
    <SingleInteraction
      assets={
        assets.filter((_) => _) as {
          name: string;
          symbol: string;
          id: string;
        }[]
      }
      spender={MINT_ROUTER_ADDRESS}
      onSubmit={handleSubmit}
      onChange={handleChange}
      defaultInputSymbol={assets[0].symbol}
      defaultOutputSymbol={indexPool.symbol}
      disableOutputSelect
    />
  );
}

function MultiTokenMintInteraction({ indexPool }: Props) {
  const { executeMint } = useMultiTokenMintCallbacks(indexPool.id);
  const handleSubmit = useCallback(
    (values: MultiInteractionValues) =>
      executeMint(values.fromAmount.toString()),
    [executeMint]
  );

  return (
    <MultiInteraction
      assets={indexPool.assets}
      spender={indexPool.id}
      onSubmit={handleSubmit}
      requiresApproval={false}
      kind="mint"
    />
  );
}
