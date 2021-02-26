import { Alert, Statistic } from "antd";
import React, { ReactNode } from "react";
import styled from "styled-components";

export interface Props {
  image?: string;
  type?: "info" | "warning" | "success" | "error";
  title: string;
  value: string;
  children?: ReactNode;
}

function BasePanel({
  image = "",
  type = "info",
  title,
  value,
  children,
}: Props) {
  return (
    <S.Alert
      message={
        <S.AlertInner>
          {image && <S.RateLeft src={image} />}
          <S.Statistic title={title} value={value} />
          {children}
        </S.AlertInner>
      }
      type={type}
    />
  );
}

type WithExtras = typeof BasePanel & {
  Fee: (props: FeeProps) => JSX.Element;
  Rate: (props: RateProps) => JSX.Element;
};

const Panel = BasePanel as WithExtras;

export default Panel;

// #region Variants
export interface FeeProps {
  amount: string | number;
  token: string;
}

Panel.Fee = function ({ amount, token }) {
  return (
    <Panel
      image={require(`assets/images/${token.toLowerCase()}.png`)}
      title="Fee"
      value={`${amount} ${token}`}
    />
  );
};

export interface RateProps {
  from: string;
  rate: number;
  to: string;
}

Panel.Rate = function ({ from, rate, to }) {
  return (
    <Panel title="Rate" value={`1 ${from} = ${rate} ${to}`}>
      <S.RateLeft src={require(`assets/images/${from.toLowerCase()}.png`)} />
      <S.RateRight src={require(`assets/images/${to.toLowerCase()}.png`)} />
    </Panel>
  );
};
// #endregion

const S = {
  Statistic: styled(Statistic)`
    ${(props) => props.theme.snippets.fancy};
    align-self: flex-end;
    margin-top: ${(props) => props.theme.spacing.small};
    margin-right: ${(props) => props.theme.spacing.small};
  `,
  Alert: styled(Alert)`
    text-align: right;
    padding: 0;
  `,
  AlertInner: styled.div`
    position: relative;
    ${(props) => props.theme.snippets.spacedBetween};
    flex-direction: row-reverse;
    overflow: hidden;
  `,
  RateLeft: styled.img`
    position: absolute;
    bottom: -35px;
    left: -12px;
    ${(props) => props.theme.snippets.imageFadedLeftRight};
    ${(props) => props.theme.snippets.size128};
  `,
  RateRight: styled.img`
    position: absolute;
    bottom: -35px;
    right: -24px;
    ${(props) => props.theme.snippets.imageFadedRightLeft};
    ${(props) => props.theme.snippets.size128};
  `,
};
