import { Asset } from "features";
import { Card, Space, Typography } from "antd";
import { CgDollar } from "react-icons/cg";
import { Token } from "components/atoms";
import Quote from "./Quote";

export interface Props {
  token: Asset;
  rank: number;
}

export default function RankedToken({ token, rank }: Props) {
  return (
    <Card style={{ width: 340 }} size="small" className="RankedToken">
      <Space
        align="center"
        className="spaced-between"
        style={{
          width: "100%",
        }}
      />
      <div style={{ flex: 1 }}>
        <Token
          address={token.id}
          name={token.name}
          image={token.symbol}
          size="medium"
        />
      </div>
      <Card.Meta
        title={<Typography.Title level={4}>{token.symbol}</Typography.Title>}
        description={
          <Typography.Title
            level={5}
            type="secondary"
            style={{
              marginTop: 0,
              marginBottom: 0,
            }}
          >
            {token.name}
          </Typography.Title>
        }
      />
      <Quote
        price={token.price}
        netChange={token.netChange}
        netChangePercent={token.netChangePercent}
        isNegative={token.isNegative}
        kind="small"
      />
    </Card>
  );

  return (
    <div>
      <Typography.Title level={3}>
        <span>#</span>
        {rank}
      </Typography.Title>
      <div>
        <div>
          <div>
            <Token
              address={token.id}
              image={token.symbol}
              name={token.symbol}
            />
            <div>
              <h2>{token.symbol}</h2>
              <h3>{token.name}</h3>
            </div>
          </div>
          <div>
            <div>{token.weightPercentage}</div>
          </div>
        </div>
        <div>
          <div>
            <CgDollar />
            <div>{token.balanceUsd}</div>
          </div>
          <div>
            <div>{token.balance}</div>
            <Token
              size="small"
              image={token.symbol}
              name={token.symbol}
              data-token={token.symbol}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
