import { Asset } from "features";
import { Card, Divider, Progress, Space, Typography } from "antd";
import { Token } from "components/atoms";
import { convert, useBreakpoints } from "helpers";
import Quote from "./Quote";

export interface Props {
  token: Asset;
  rank: number;
  fixedSize?: boolean;
}

export default function RankedToken({ token, fixedSize = false }: Props) {
  const { isMobile } = useBreakpoints();
  const balanceAction = (
    <>
      <Typography.Text type="secondary">Balance (in tokens)</Typography.Text>
      <Typography.Title
        level={4}
        style={{
          margin: 0,
        }}
      >
        {token.balance} {token.symbol}
      </Typography.Title>
    </>
  );
  const usdBalanceAction = (
    <>
      <Typography.Text type="secondary">Balance (in USD)</Typography.Text>
      <Typography.Title
        level={4}
        type="success"
        style={{
          margin: 0,
        }}
      >
        {token.balanceUsd &&
          convert.toCurrency(parseFloat(token.balanceUsd.replace(/,/g, "")))}
      </Typography.Title>
    </>
  );
  const actions = isMobile
    ? [
        <div key="1">
          {balanceAction}
          <Divider
            style={{
              marginTop: 10,
              marginBottom: 10,
            }}
          />
          {usdBalanceAction}
        </div>,
      ]
    : [
        <div key="1">{balanceAction}</div>,
        <div key="2">{usdBalanceAction}</div>,
      ];

  return (
    <>
      <Card
        size={isMobile ? "small" : "default"}
        className="RankedToken"
        style={{ width: fixedSize ? 460 : "100%", flex: 1 }}
        actions={actions}
      >
        <Space
          align="center"
          className="spaced-between"
          style={{
            width: "100%",
          }}
        />
        <div style={{ flex: 3 }}>
          <Card.Meta
            title={
              <Space wrap={true} style={{ textAlign: "left" }}>
                <Token
                  address={token.id}
                  name={token.name}
                  image={token.symbol}
                  size="small"
                />
                <Typography.Title className="no-margin-bottom" level={4}>
                  {token.symbol}
                </Typography.Title>
                {!isMobile && (
                  <Typography.Text
                    type="secondary"
                    style={{
                      marginTop: 0,
                      marginBottom: 0,
                    }}
                  >
                    {token.name}
                  </Typography.Text>
                )}
              </Space>
            }
            description={
              <Quote
                price={token.price}
                netChange={token.netChange}
                netChangePercent={token.netChangePercent}
                isNegative={token.isNegative}
                kind="small"
                inline={!isMobile}
              />
            }
          />
        </div>
        <Progress
          size="small"
          type="dashboard"
          percent={parseFloat(token.weightPercentage.replace(/%/g, ""))}
        />
      </Card>
      {isMobile && <Divider />}
    </>
  );
}
