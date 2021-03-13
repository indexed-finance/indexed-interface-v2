import { Asset } from "features";
import { Card, Progress, Space, Typography } from "antd";
import { Token } from "components/atoms";
import { convert } from "helpers";
import Quote from "./Quote";

export interface Props {
  token: Asset;
  rank: number;
}

export default function RankedToken({ token, rank }: Props) {
  return (
    <Card
      size="small"
      className="RankedToken"
      style={{ width: "100%" }}
      actions={[
        <div key="1">
          <Typography.Text type="secondary">Balance (in USD)</Typography.Text>
          <Typography.Title
            level={4}
            type="success"
            style={{
              margin: 0,
            }}
          >
            {token.balanceUsd &&
              convert.toCurrency(
                parseFloat(token.balanceUsd.replace(/,/g, ""))
              )}
          </Typography.Title>
        </div>,
        <div key="2">
          <Typography.Text type="secondary">
            Balance (in tokens)
          </Typography.Text>
          <Typography.Title
            level={4}
            style={{
              margin: 0,
            }}
          >
            {token.balance} {token.symbol}
          </Typography.Title>
        </div>,
      ]}
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
            <Space align="center">
              <Token
                address={token.id}
                name={token.name}
                image={token.symbol}
                size="large"
              />
              <Typography.Title className="no-margin-bottom" level={4}>
                {token.symbol}
              </Typography.Title>
              <Typography.Text
                type="secondary"
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                {token.name}
              </Typography.Text>
            </Space>
          }
          description={
            <Quote
              price={token.price}
              netChange={token.netChange}
              netChangePercent={token.netChangePercent}
              isNegative={token.isNegative}
              kind="small"
              inline={true}
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
  );
}
