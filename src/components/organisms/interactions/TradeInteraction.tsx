import { AiOutlineArrowRight } from "react-icons/ai";
import { Flipper, Token } from "components";
import { Form, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { TokenExchangeRate } from "components/molecules";
import {
  useHistoryChangeCallback,
  useTokenApproval,
  useTokenRandomizer,
} from "./common";
import React, { useCallback, useMemo, useState } from "react";
import TokenSelector from "../TokenSelector";
import cloneDeep from "lodash.clonedeep";
import styled, { keyframes } from "styled-components";

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
    <S.Form
      fields={fields}
      onFieldsChange={(_, [newFrom, newTo]) => {
        setFrom(newFrom);
        setTo(newTo);
      }}
    >
      <S.Title>
        <span>Trade</span>
        {from.value.token && to.value.token && (
          <span>
            <Token name="Baseline" image={from.value.token} />
            <S.Swap />
            <Token name="Comparison" image={to.value.token} />
          </span>
        )}
      </S.Title>
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
        <S.LastItem>
          <TokenExchangeRate
            baseline={from.value.token}
            comparison={to.value.token}
            rate="1.00"
            fee="1.00"
          />
        </S.LastItem>
      )}
    </S.Form>
  );
}

const blinking = keyframes`
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 0.3;
  }
`;

const S = {
  Form: styled(Form)`
    img {
      ${(props) => props.theme.snippets.size40};
      opacity: 0.7;
      border-radius: 50%;
      animation-name: ${blinking};
      animation-duration: 2s;
      animation-iteration-count: infinite;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
  `,
  Title: styled(Typography.Title)`
    ${(props) => props.theme.snippets.spacedBetween};
    position: relative;
    font-weight: 200 !important;
  `,
  Swap: styled(AiOutlineArrowRight)`
    position: absolute;
    top: 9px;
    right: 21px;
  `,
  LastItem: styled(Form.Item)`
    margin-bottom: 0;
  `,
};
