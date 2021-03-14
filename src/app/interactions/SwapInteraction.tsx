import { AiOutlineArrowRight } from "react-icons/ai";
import { AppState, FormattedIndexPool, selectors, signer } from "features";
import { Flipper, Token } from "components/atoms";
import { Button, Form, Space } from "antd";
import { TokenExchangeRate, TokenSelector } from "components";
import { actions } from "features";
import { convert } from "helpers";
import { helpers } from "ethereum";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useHistoryChangeCallback,
  // useTokenApproval,
  useTokenRandomizer,
} from "./common";
import TwoTokenExchangeForm, { TwoTokenExchangeFormValues } from "components/organisms/TwoTokenExchangeForm";
import { ApprovalStatus } from "features/user/slice";

interface Props {
  pool: FormattedIndexPool;
}

const ZERO = convert.toBigNumber("0");
const SLIPPAGE_RATE = 0.01;

export default function SwapInteraction({ pool }: Props) {
  const dispatch = useDispatch();
  const fullPool = useSelector((state: AppState) =>
    selectors.selectPool(state, pool.id)
  );
  const swapFee = useSelector((state: AppState) => selectors.selectSwapFee(state, pool.id));
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const [maxPrice, setMaxPrice] = useState(ZERO);
  const [specifiedSide, setSpecifiedSide] = useState<"input" | "output">("input");

  const handleChange = useCallback(({ from, to, lastTouchedField }: TwoTokenExchangeFormValues) => {
    if (!fullPool || !swapFee) return;
    const inputToken = fullPool.tokens.entities[
      tokenLookup[from.token.toLowerCase()].id.toLowerCase()
    ];
    const outputToken = fullPool.tokens.entities[
      tokenLookup[to.token.toLowerCase()].id.toLowerCase()
    ];
    if (!inputToken || !outputToken) return;
    if (lastTouchedField === "INPUT") {
      const {
        outputAmount,
        spotPriceAfter,
        isGoodResult
      } = helpers.calculateOutputFromInput(
        inputToken,
        outputToken,
        from.amount.toString(),
        swapFee
      );
      if (isGoodResult) {
        to.amount = outputAmount;
        setMaxPrice(
          helpers.upwardSlippage(spotPriceAfter, SLIPPAGE_RATE)
        );
        setSpecifiedSide("input");
      }
    } else {
      const {
        inputAmount,
        spotPriceAfter,
        isGoodResult,
      } = helpers.calculateInputFromOutput(
        inputToken,
        outputToken,
        to.amount.toString(),
        swapFee
      );
      if (isGoodResult) {
        setMaxPrice(
          helpers.upwardSlippage(spotPriceAfter, SLIPPAGE_RATE)
        );
        from.amount = inputAmount;
        setSpecifiedSide("output");
      }
    }
  }, [setMaxPrice, fullPool, swapFee, tokenLookup]);

  const handleSubmit = useCallback(
    async (values: SwapValues) => {
      if (pool && signer) {
        const { amount: inputAmount, token: inputToken } = values.from;
        const { amount: outputAmount, token: outputToken } = values.to;

        dispatch(
          actions.swap(
            pool.id,
            spec,
            inputAmount.toString(),
            inputToken.toLowerCase(),
            outputAmount.toString(),
            outputToken.toLowerCase(),
            maxPrice
          )
        );
      }
    },
    [dispatch, pool, maxPrice]
  );
  
  const { status, approve } = useTokenApproval({
    spender: pool.id,
    token,
    amount
  });

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
