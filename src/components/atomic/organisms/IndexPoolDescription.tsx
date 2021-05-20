import { Card, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { INDEX_POOL_TAGLINES } from "config";
import { Token } from "../atoms";

export function IndexPoolDescription({ id, name, symbol }: FormattedIndexPool) {
  return (
    <Card>
      <Typography.Title level={2}>
        About <Token name={name} symbol={symbol} address={id} size="medium" />
      </Typography.Title>
      <Typography.Text
        style={{
          fontSize: 14,
          paddingLeft: 24,
          display: "block",
          borderLeft: "2px solid #49ffff",
        }}
      >
        {INDEX_POOL_TAGLINES[id] ?? ""}
      </Typography.Text>
    </Card>
  );
}
