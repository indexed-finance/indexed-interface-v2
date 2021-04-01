import { BaseInteraction, InteractionValues } from "./BaseInteraction";
import { COMMON_BASE_TOKENS, MINT_ROUTER_ADDRESS, SLIPPAGE_RATE } from "config";
import { FormattedIndexPool, actions, selectors } from "features";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Radio } from "antd";
import { Route } from "react-router-dom";
import { convert } from "helpers";
import { downwardSlippage, upwardSlippage } from "ethereum";
import {
  useMintRouterCallbacks,
  usePoolToTokens,
  useSingleTokenMintCallbacks,
  useTranslator,
  useUserDataRegistrar,
} from "hooks";
import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";

interface Props {
  pool: FormattedIndexPool;
}

export default function MintInteraction({ pool }: Props) {
  const [mintType, setMintType] = useState<"single" | "uniswap" | "multi">(
    "single"
  );

  return (
    <Fragment>
      <Radio.Group
        value={mintType}
        onChange={({ target: { value } }) => {
          setMintType(value);
        }}
      >
        <Radio.Button value="single">Single Input</Radio.Button>
        <Radio.Button value="multi">Multi Input</Radio.Button>
        <Radio.Button value="uniswap">Uniswap</Radio.Button>
      </Radio.Group>

      <Route path="/single">
        <SingleTokenMintInteraction pool={pool} />
      </Route>
      <Route path="/multi">
        <MultiTokenMintInteraction pool={pool} />
      </Route>
      <Route path="/uniswap">
        <UniswapMintInteraction pool={pool} />
      </Route>
    </Fragment>
  );
}

function SingleTokenMintInteraction({ pool }: Props) {
  const tx = useTranslator();
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const {
    calculateAmountIn,
    calculateAmountOut,
    executeMint,
  } = useSingleTokenMintCallbacks(pool.id);
  const poolToTokens = usePoolToTokens(pool);

  useUserDataRegistrar(poolToTokens, actions, selectors);

  const handleChange = useCallback(
    (values: InteractionValues) => {
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
    (values: InteractionValues) => {
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

  return (
    <BaseInteraction
      title={tx("MINT")}
      assets={pool.assets}
      spender={pool.id}
      onSubmit={handleSubmit}
      onChange={handleChange}
      defaultOutputSymbol={pool.symbol}
      disableOutputSelect
    />
  );
}

function MultiTokenMintInteraction({ pool }: Props) {
  return <div>Multi</div>;
}

function UniswapMintInteraction({ pool }: Props) {
  const tx = useTranslator();
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const {
    tokenIds,
    getBestMintRouteForAmountIn,
    getBestMintRouteForAmountOut,
    executeRoutedMint,
  } = useMintRouterCallbacks(pool.id);
  const assets = [...COMMON_BASE_TOKENS];
  const poolToTokens = useMemo(() => ({ [MINT_ROUTER_ADDRESS]: tokenIds }), [
    tokenIds,
  ]);

  useUserDataRegistrar(poolToTokens, actions, selectors);

  const handleChange = useCallback(
    (values: InteractionValues) => {
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
    (values: InteractionValues) => {
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
    <BaseInteraction
      title={tx("MINT_WITH_UNISWAP")}
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
      defaultOutputSymbol={pool.symbol}
      disableOutputSelect
    />
  );
}
