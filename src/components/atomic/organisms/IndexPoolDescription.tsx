import { Card, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { Token } from "../atoms";

export function IndexPoolDescription({ id, name, symbol }: FormattedIndexPool) {
  return (
    <Card>
      <Typography.Title level={2}>
        About{" "}
        <Token
          image=""
          name={name}
          symbol={symbol}
          address={id}
          size="medium"
        />
      </Typography.Title>
      <Typography.Text
        style={{
          fontSize: 14,
          paddingLeft: 24,
          display: "block",
          borderLeft: "2px solid #FC2FCE",
        }}
      >
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatem
        rem, deserunt officiis et, optio, quod eum consequuntur itaque suscipit
        impedit recusandae incidunt nostrum sapiente expedita ut eius cum ea
        beatae!
      </Typography.Text>
    </Card>
  );
}
