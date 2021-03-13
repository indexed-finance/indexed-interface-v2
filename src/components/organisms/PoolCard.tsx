import { Card, Space, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { Quote, RankedToken } from "components/molecules";
import { Token } from "components/atoms";
import { useHistory } from "react-router-dom";

export interface Props {
  pool: FormattedIndexPool;
}

export default function PoolCard({ pool }: Props) {
  const { assets, name, id, slug } = pool;
  const history = useHistory();

  return (
    <Card
      onClick={() => history.push(`/pools/${slug}`)}
      key={id}
      hoverable={true}
      title={
        <Space align="start" className="spaced-between">
          <div>
            <Typography.Title
              type="secondary"
              level={3}
              style={{
                marginBottom: 0,
              }}
            >
              {pool.category}
            </Typography.Title>
            <Typography.Title
              level={2}
              style={{
                marginTop: 0,
              }}
            >
              {name}
            </Typography.Title>
          </div>
          <Quote
            price={pool.priceUsd}
            netChange={pool.netChange}
            netChangePercent={pool.netChangePercent}
            isNegative={false}
            centered={false}
          />
        </Space>
      }
      actions={[
        <div key="1">
          {assets.map((token, index) => (
            <Token
              key={index}
              address={token.id}
              name={token.symbol}
              image={token.symbol}
            />
          ))}
        </div>,
      ]}
    >
      <Space align="start" className="RankedTokenWrapper">
        {pool.assets.map((token, index) => (
          <RankedToken key={token.symbol} rank={index + 1} token={token} />
        ))}
      </Space>
    </Card>
  );
}
