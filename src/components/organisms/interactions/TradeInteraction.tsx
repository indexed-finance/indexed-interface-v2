import { AiOutlineArrowRight } from "react-icons/ai";
import { Flipper, Token } from "components";
import { Form, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { TokenExchangeRate } from "components/molecules";
import { useCallback, useMemo, useState } from "react";
import {
  useHistoryChangeCallback,
  useTokenApproval,
  useTokenRandomizer,
} from "./common";
import TokenSelector from "../TokenSelector";
import cloneDeep from "lodash.clonedeep";

interface FieldData {
  name: string | number | (string | number)[];
  value?: any;
  touched?: boolean;
  validating?: boolean;
  errors?: string[];
}

interface Props {
  pool: null | FormattedIndexPool;
}

const INITIAL_FROM: FieldData = {
  name: "from",
  value: {
    token: "ETH",
    amount: 0,
  },
};

const INITIAL_TO: FieldData = {
  name: "to",
  value: {
    token: "",
    amount: 0,
  },
};

export default function TradeInteraction({ pool }: Props) {
  const [from, setFrom] = useState(INITIAL_FROM);
  const [to, setTo] = useState(INITIAL_TO);
  const fields = useMemo(() => [from, to], [from, to]);
  const handleFlip = useCallback(() => {
    const flippedValue = {
      from: to.value,
      to: from.value,
    };
    const nextFrom = cloneDeep(from);
    const nextTo = cloneDeep(to);

    nextFrom.value = flippedValue.from;
    nextTo.value = flippedValue.to;

    setFrom(nextFrom);
    setTo(nextTo);
  }, [from, to]);

  useTokenApproval({
    pool,
    from: from.value,
    to: to.value,
    onSendTransaction: () => {
      /* */
    },
  });

  useTokenRandomizer({
    pool,
    to: to.value.token,
    changeTo: (newTo: string) =>
      setTo((prevTo) => {
        const nextTo = cloneDeep(prevTo);
        nextTo.value.token = newTo;
        return nextTo;
      }),
  });

  useHistoryChangeCallback(() => {
    setFrom(INITIAL_FROM);
    setTo(INITIAL_TO);
  });

  return (
    <Form
      fields={fields}
      onFieldsChange={(_, [newFrom, newTo]) => {
        setFrom(newFrom);
        setTo(newTo);
      }}
    >
      <Typography.Title>
        <span>Trade</span>
        {from.value.token && to.value.token && (
          <span>
            <Token name="Baseline" image={from.value.token} />
            <AiOutlineArrowRight />
            <Token name="Comparison" image={to.value.token} />
          </span>
        )}
      </Typography.Title>
      <Form.Item name="from">
        {pool && (
          <TokenSelector
            label="From"
            pool={pool}
            selectable={from.value.token !== "ETH"}
          />
        )}
      </Form.Item>
      <Flipper onFlip={handleFlip} />
      <Form.Item name="to">
        {pool && (
          <TokenSelector
            label="To"
            pool={pool}
            selectable={to.value.token !== "ETH"}
          />
        )}
      </Form.Item>
      {from.value.token && to.value.token && (
        <Form.Item>
          <TokenExchangeRate
            baseline={from.value.token}
            comparison={to.value.token}
            rate="1.00"
            fee="1.00"
          />
        </Form.Item>
      )}
    </Form>
  );
}
