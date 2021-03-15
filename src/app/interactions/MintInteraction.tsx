import {
  AppState,
  FormattedIndexPool,
  selectors,
} from "features";
import { SLIPPAGE_RATE, UNISWAP_ROUTER_ADDRESS } from "config";
import { convert } from "helpers";
import { downwardSlippage, upwardSlippage } from "ethereum";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useSingleTokenMintCallbacks } from "hooks/useMintCallbacks";
import { useTokenUserDataListener } from "features/batcher/hooks";
import BaseInteraction, { InteractionValues } from "./BaseInteraction";
import BigNumber from "bignumber.js";

interface Props {
  pool: FormattedIndexPool;
}
/* export default function MintInteraction({ pool }: Props) {

  return <p>MintInteraction</p>;
} */

export default function SingleTokenMintInteraction({ pool }: Props) {
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const tokenIds = useSelector((state: AppState) => [
    ...selectors.selectPoolTokenIds(state, pool.id),
    pool.id
  ]);
  useTokenUserDataListener(pool.id, tokenIds);
  const assets = useSelector((state: AppState) => selectors.selectTokensById(state, tokenIds));

  const {
    calculateAmountIn,
    calculateAmountOut,
    executeMint
  } = useSingleTokenMintCallbacks(pool.id);

  useTokenUserDataListener(UNISWAP_ROUTER_ADDRESS, tokenIds);

  const handleChange = useCallback((values: InteractionValues) => {
    const {
      fromToken,
      fromAmount,
      toToken,
      toAmount,
      lastTouchedField
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
          values.toAmount = parseFloat(convert.toBalance(
            downwardSlippage(output.poolAmountOut as BigNumber, SLIPPAGE_RATE), decimals
          ));
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
          values.fromAmount = parseFloat(convert.toBalance(
            upwardSlippage(input.tokenAmountIn as BigNumber, SLIPPAGE_RATE),
            decimals
          ));
        }
      }
    }
  }, [calculateAmountIn, calculateAmountOut, tokenLookup]);

  const handleSubmit = useCallback((values: InteractionValues) => {
    const {
      fromToken,
      fromAmount,
      toToken,
      toAmount,
      lastTouchedField
    } = values;
    if (
      fromAmount > 0 && toAmount > 0 &&
      fromToken && toToken
    ) {
      executeMint(
        fromToken,
        lastTouchedField,
        lastTouchedField === "from" ? fromAmount.toString() : toAmount.toString()
      );
    }
  }, [executeMint])

  return (
    <BaseInteraction
      title="Mint"
      assets={pool.assets}
      spender={pool.id}
      onSubmit={handleSubmit}
      onChange={handleChange}
      defaultOutputSymbol={pool.symbol}
    />
  );
}