import { COMMON_BASE_TOKENS, MINT_ROUTER_ADDRESS, SLIPPAGE_RATE } from "config";
import { FormattedIndexPool, selectors } from "features";
import { Fragment, useCallback, useState } from "react";
import {
  MultiInteraction,
  MultiInteractionValues,
  SingleInteraction,
  SingleInteractionValues,
} from "./BaseInteraction";
import { Radio } from "antd";
import { convert } from "helpers";
import { downwardSlippage, upwardSlippage } from "ethereum";
import {
  useBalanceAndApprovalRegistrar,
  useMintRouterCallbacks,
  usePoolTokenAddresses,
  useSingleTokenMintCallbacks,
  useTranslator,
} from "hooks";
import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";

interface Props {
  indexPool: FormattedIndexPool;
}

export default function MintInteraction({ indexPool }: Props) {
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
        <Radio.Button value="uniswap">Uniswap</Radio.Button>
        <Radio.Button value="multi">Multi Input</Radio.Button>
      </Radio.Group>

      {mintType === "single" && (
        <SingleTokenMintInteraction indexPool={indexPool} />
      )}
      {mintType === "uniswap" && (
        <UniswapMintInteraction indexPool={indexPool} />
      )}
      {mintType === "multi" && (
        <MultiTokenMintInteraction indexPool={indexPool} />
      )}
    </Fragment>
  );
}

function SingleTokenMintInteraction({ indexPool }: Props) {
  const tx = useTranslator();
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const {
    calculateAmountIn,
    calculateAmountOut,
    executeMint,
  } = useSingleTokenMintCallbacks(indexPool.id);
  // const indexpoolToTokens = useIndexPoolToTokens(indexpool);
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
  // useUserDataRegistrar(indexpoolToTokens);

  return (
    <SingleInteraction
      title={tx("MINT")}
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
  const tx = useTranslator();
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
      defaultOutputSymbol={indexPool.symbol}
      disableOutputSelect
    />
  );
}

function MultiTokenMintInteraction({ indexPool }: Props) {
  const tx = useTranslator();
  const handleSubmit = useCallback((values: MultiInteractionValues) => {
    //
  }, []);
  // const { calculateAmountsIn, executeMint } = useMultiTokenMintCallbacks(
  //   indexpool.id
  // );
  // const value = calculateAmountsIn(amount.toString());

  return (
    <MultiInteraction
      title={tx("MINT")}
      assets={indexPool.assets}
      spender={indexPool.id}
      onSubmit={handleSubmit}
    />
  );
}