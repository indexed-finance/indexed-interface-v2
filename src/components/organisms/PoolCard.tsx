import { Avatar, Card, Space, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { Quote, RankedToken } from "components/molecules";
import { Token } from "components/atoms";
import { useBreakpoints } from "helpers";
import { useHistory } from "react-router-dom";

export interface Props {
  pool: FormattedIndexPool;
}

export default function PoolCard({ pool }: Props) {
  const { assets, name, id, slug } = pool;
  const history = useHistory();
  const { isMobile } = useBreakpoints();

  return (
    <Card
      onClick={() => history.push(`/pools/${slug}`)}
      key={id}
      hoverable={true}
      title={
        <Space
          align="start"
          className="spaced-between"
          style={{ width: "100%" }}
        >
          <div>
            <Typography.Title
              type="secondary"
              level={isMobile ? 5 : 3}
              style={{
                marginBottom: 0,
              }}
            >
              {pool.category}
            </Typography.Title>
            <Typography.Title
              level={isMobile ? 5 : 2}
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
        <Avatar.Group
          maxCount={isMobile ? 6 : 20}
          style={{ paddingLeft: "1rem", paddingRight: "1rem" }}
        >
          {assets.map((token, index) => [
            <Token
              key={index}
              address={token.id}
              name={token.symbol}
              image={token.symbol}
              size={isMobile ? "small" : "medium"}
            />,
          ])}
        </Avatar.Group>,
      ]}
    >
      <Space align="start" className="RankedTokenWrapper">
        {pool.assets.map((token, index) => (
          <RankedToken
            key={token.symbol}
            rank={index + 1}
            token={token}
            fixedSize={true}
          />
        ))}
      </Space>
    </Card>
  );
}
