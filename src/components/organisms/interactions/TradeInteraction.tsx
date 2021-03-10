import { Flipper } from "components";
import { Form } from "antd";
import { FormattedIndexPool } from "features";
import {
  useHistoryChangeCallback,
  useTokenApproval,
  useTokenRandomizer,
} from "./common";
import React, { useCallback, useMemo, useState } from "react";
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
    token: "",
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
      from: to,
      to: from,
    };

    setFrom(flippedValue.from);
    setTo(flippedValue.to);
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
    from: from.value.token,
    to: to.value.token,
    changeFrom: (newFrom: string) =>
      setFrom((prevFrom) => {
        const nextFrom = cloneDeep(prevFrom);
        nextFrom.value.token = newFrom;
        return nextFrom;
      }),
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
      <Form.Item name="from">
        {pool && <TokenSelector label="From" pool={pool} />}
      </Form.Item>
      <Flipper onFlip={handleFlip} />
      <Form.Item name="to">
        {pool && <TokenSelector label="To" pool={pool} />}
      </Form.Item>
    </Form>
  );
}
