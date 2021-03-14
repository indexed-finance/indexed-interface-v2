import { AppState, FormattedIndexPool, actions, selectors } from "features";
import { COMMON_BASE_TOKENS, UNISWAP_ROUTER_ADDRESS } from "config";
import { Trade } from "@uniswap/sdk";
import { convert } from "helpers";
import { useDispatch, useSelector } from "react-redux";

import { ApprovalStatus } from "features/user/slice";
import { Button } from "antd";
import { useTokenApproval } from "./common";
import { useTokenUserDataListener } from "ethereum/listeners";
import { useUniswapTradingPairs } from "ethereum/helpers";
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import TwoTokenExchangeForm, { TwoTokenExchangeFormValues } from "components/organisms/TwoTokenExchangeForm";


interface Props {
  pool: FormattedIndexPool;
}

export default function TradeInteraction({ pool }: Props) {
  const [trade, setTrade] = useState<Trade | undefined>();
  const dispatch = useDispatch();

  const tokenIds = useMemo(() => {
    return [pool.id, ...COMMON_BASE_TOKENS.map(c => c.id)];
  }, [pool.id]);

  useTokenUserDataListener(UNISWAP_ROUTER_ADDRESS, tokenIds);

  const { calculateBestTradeForExactInput, calculateBestTradeForExactOutput } = useUniswapTradingPairs(tokenIds);
  const assets = useSelector((state: AppState) => selectors.selectTokensById(state, tokenIds));
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);

  const handleChange = useCallback(({ from, to, lastTouchedField }: TwoTokenExchangeFormValues) => {
    const inputToken = tokenLookup[from.token.toLowerCase()];
    const outputToken = tokenLookup[to.token.toLowerCase()];

    if (lastTouchedField === "INPUT") {
      const typedAmountIn = from.amount;
      let amountOut = 0;
      if (typedAmountIn) {
        const amountIn = convert.toToken(typedAmountIn.toString(), inputToken.decimals).toString(10);
        const bestTrade = calculateBestTradeForExactInput(inputToken, outputToken, amountIn);
        setTrade(bestTrade);
        amountOut = parseFloat(bestTrade?.outputAmount.toFixed(4) ?? "0");
      }
      to.amount = amountOut;
    } else {
      const typedAmountOut = to.amount;
      let amountIn = 0;
      if (typedAmountOut) {
        const amountOut = convert
          .toToken(typedAmountOut.toString(), outputToken.decimals)
          .toString(10);
        const bestTrade = calculateBestTradeForExactOutput(
          inputToken,
          outputToken,
          amountOut
        );
        setTrade(bestTrade);
        amountIn = parseFloat(bestTrade?.inputAmount.toFixed(4) ?? "0");
      }
      from.amount = amountIn;
    }
  }, [tokenLookup, calculateBestTradeForExactInput, calculateBestTradeForExactOutput]);

  const [token, amount] = useMemo(() => {
    if (!trade) return ["", "0"];
    const token = trade.route.path[0].address;
    const amount = trade.inputAmount.raw.toString(10)
    return [token, amount];
  }, [trade]);

  const { status, approve } = useTokenApproval({
    spender: UNISWAP_ROUTER_ADDRESS,
    token,
    amount
  });

  const handleSubmit = useCallback(() => {
    if (trade) {
      dispatch(actions.trade(trade));
    }
  }, [dispatch, trade]);

  return <TwoTokenExchangeForm
    title={"Trade"}
    assetOptions={assets as any}
    onChange={handleChange}
    defaultInput="DAI"
    defaultOutput={pool.symbol}
    swapFee={0.003}
  >
    {
      status === ApprovalStatus.UNKNOWN
      ? <></>
      : status === ApprovalStatus.APPROVED
        ? <Button onClick={handleSubmit} type="primary"> Trade </Button>
        : <Button onClick={approve} type="primary"> Approve </Button>
    }
  </TwoTokenExchangeForm>;
}
