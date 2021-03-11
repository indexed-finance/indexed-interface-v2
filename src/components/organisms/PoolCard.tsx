import { Card, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { Token } from "components/atoms";
import { useHistory } from "react-router-dom";
import RankedTokenList from "./RankedTokenList";
import React from "react";

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
      size="small"
      title={
        <>
          <Typography.Text type="secondary">{pool.category}</Typography.Text>{" "}
          <br />
          {name}
        </>
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
      <div>
        <RankedTokenList pool={pool} />
      </div>
    </Card>
  );
}
