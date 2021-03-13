import { AiOutlineArrowRight } from "react-icons/ai";
import { AppState, FormattedIndexPool, selectors } from "features";
import { COMMON_BASE_TOKENS } from "config";
import { Flipper, Token, TokenSelector } from "components";
import { Form, Typography } from "antd";
import { TokenExchangeRate } from "components/molecules";
import { Trade } from "@uniswap/sdk";
import { convert } from "helpers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useUniswapTradingPairs } from "ethereum/helpers";

interface Props {
  pool: null | FormattedIndexPool;
}

type TradeValues = typeof INITIAL_STATE;

const INITIAL_STATE = {
  from: {
    token: "DAI",
    amount: 0,
  },
  to: {
    token: "",
    amount: 0,
  },
};

const { Item } = Form;

export default function TradeInteraction({ pool }: Props) {
  const [form] = Form.useForm<TradeValues>();
  const [trade, setTrade] = useState<Trade | undefined>();

  const previousFormValues = useRef<TradeValues>(INITIAL_STATE);
  const lastTouchedField = useRef<"input" | "output">("input");

  const [, setRenderCount] = useState(0);

  const handleFlip = () => {
    const { from, to } = form.getFieldsValue();
    const flippedValue = {
      from: to,
      to: from,
    };

    form.setFieldsValue(flippedValue);
    previousFormValues.current = flippedValue;
    triggerUpdate();
  };
  const triggerUpdate = () => setRenderCount((prev) => prev + 1);

  // const poolToken = useSelector((state: AppState) => selectors.selectTokenById(state, pool?.id ?? ""));
  const tokenIds = useMemo(
    () => [pool?.id ?? "", ...COMMON_BASE_TOKENS.map((c) => c.id)],
    [pool]
  );
  const {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput,
  } = useUniswapTradingPairs(tokenIds);
  const assets = useSelector((state: AppState) =>
    selectors.selectTokensById(state, tokenIds)
  );
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);

  useEffect(() => {
    if (form && pool) {
      const fields = form.getFieldsValue();
      if (fields && !fields.to.token) {
        const newFormValues = {
          to: {
            token: pool.symbol,
            amount: 0,
          },
        };
        form.setFieldsValue(newFormValues);
      }
    }
  }, [form, pool]);

  const calculateInputForExactOutput = useCallback(
    (changedValues: TradeValues) => {
      const { from } = form.getFieldsValue();
      if (!changedValues.to.token || !from.token) return;
      let amountIn: number;
      if (!changedValues.to.amount) {
        amountIn = 0;
      } else {
        const inputToken = tokenLookup[from.token.toLowerCase()];
        const outputToken = tokenLookup[changedValues.to.token.toLowerCase()];
        const amountOut = convert
          .toToken(changedValues.to.amount.toString(), outputToken.decimals)
          .toString(10);
        const bestTrade = calculateBestTradeForExactOutput(
          inputToken,
          outputToken,
          amountOut
        );
        setTrade(bestTrade);
        amountIn = parseFloat(bestTrade?.inputAmount.toFixed(4) ?? "0");
      }
      form.setFieldsValue({
        from: {
          token: from.token,
          amount: amountIn,
        },
      });
    },
    [calculateBestTradeForExactOutput, form, tokenLookup]
  );

  const calculateOutputForExactInput = useCallback(
    (changedValues: TradeValues) => {
      const { to } = form.getFieldsValue();
      if (!changedValues.from.token || !to.token) return;
      let amountOut: number;
      if (!changedValues.from.amount) {
        amountOut = 0;
      } else {
        const inputToken = tokenLookup[changedValues.from.token.toLowerCase()];
        const outputToken = tokenLookup[to.token.toLowerCase()];
        const amountIn = convert
          .toToken(changedValues.from.amount.toString(), inputToken.decimals)
          .toString(10);
        const bestTrade = calculateBestTradeForExactInput(
          inputToken,
          outputToken,
          amountIn
        );
        setTrade(bestTrade);
        amountOut = parseFloat(bestTrade?.outputAmount.toFixed(4) ?? "0");
      }
      form.setFieldsValue({
        to: {
          token: to.token,
          amount: amountOut,
        },
      });
    },
    [calculateBestTradeForExactInput, form, tokenLookup]
  );

  const checkAmount = (_: any, value: { amount: number }) => {
    return value.amount > 0
      ? Promise.resolve()
      : Promise.reject("Amount must be greater than zero.");
  };

  const [price, fee, baseline, comparison] = useMemo(() => {
    const fields = form?.getFieldsValue();
    if (!fields || !fields.from || !fields.to) {
      return ["0", "0", "", ""];
    }
    const baseline = fields.from.token;
    const comparison = fields.to.token;
    if (!trade) {
      return ["0", "0", baseline, comparison];
    }
    const price = trade.executionPrice.toFixed(4);
    const fee = trade.outputAmount
      .multiply("3")
      .divide("1000")
      .toSignificant(5);
    return [price, fee, baseline, comparison];
  }, [form, trade]);

  const fromOptions = useMemo(() => {
    const fields = form.getFieldsValue();
    if (!fields.to) return assets;
    return assets.filter((a) => fields.to.token !== a?.symbol);
  }, [assets, form]);

  const toOptions = useMemo(() => {
    const fields = form.getFieldsValue();
    if (!fields.from) return assets;
    return assets.filter((a) => fields.from.token !== a?.symbol);
  }, [assets, form]);

  return (
    <Form
      form={form}
      initialValues={INITIAL_STATE}
      onValuesChange={(changedValues) => {
        if (changedValues.from) {
          lastTouchedField.current = "input";
          calculateOutputForExactInput(changedValues);
        } else if (changedValues.to) {
          lastTouchedField.current = "output";
          calculateInputForExactOutput(changedValues);
        }
      }}
    >
      <Typography.Title>
        <span>Trade</span>
        {baseline && comparison && (
          <span>
            <Token name="Baseline" image={baseline} />
            <AiOutlineArrowRight />
            <Token name="Comparison" image={comparison} />
          </span>
        )}
      </Typography.Title>
      <Item name="from" rules={[{ validator: checkAmount }]}>
        {pool && <TokenSelector label="From" assets={fromOptions as any} />}
      </Item>
      <Flipper onFlip={handleFlip} />
      <Item name="to" rules={[{ validator: checkAmount }]}>
        {pool && <TokenSelector label="To" assets={toOptions as any} />}
      </Item>
      <Item>
        <TokenExchangeRate {...{ baseline, comparison, fee, rate: price }} />
      </Item>
    </Form>
  );
}
