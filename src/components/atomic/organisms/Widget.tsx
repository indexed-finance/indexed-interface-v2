import { Badge, Card, Col, Divider, Row, Typography } from "antd";
import { HTMLProps, ReactNode } from "react";
import { Quote } from "components/atomic/molecules";
import { Token } from "components/atomic/atoms";
import { convert } from "helpers";
import { useBreakpoints } from "hooks";
import noop from "lodash.noop";

interface Props extends HTMLProps<HTMLDivElement> {
  symbol: string;
  address: string;
  price?: string;
  priceChange?: string;
  children?: ReactNode;
  stats?: ReactNode;
  actions?: ReactNode;
  badge?: string;
  badgeColor?: string;
  onClick?(): void;
}

export function WidgetGroup({ children }: { children: ReactNode }) {
  return <div className="fake-flex-gap">{children}</div>;
}

export function Widget({
  symbol,
  address,
  price = "",
  priceChange = "",
  children = null,
  stats = null,
  actions = null,
  onClick = noop,
  badge = "",
  badgeColor = "blue",
  ...rest
}: Props) {
  const { isMobile } = useBreakpoints();
  const formattedPrice = convert.toCurrency(parseFloat(price));
  const inner = (
    <div
      onClick={onClick}
      role="button"
      style={{
        cursor: onClick === noop ? "initial" : "pointer",
      }}
      {...rest}
    >
      <Card
        hoverable={true}
        style={{
          borderRadius: "1.4rem",
          padding: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {symbol}
          <Token
            name={symbol}
            address={address}
            symbol={symbol}
            symbolOverride={
              ["UNIV2:", "SUSHI:"].some((prefix) => symbol.startsWith(prefix))
                ? symbol.split(":")[1].replace(/-/g, "/")
                : symbol
            }
            size="medium"
            style={{ marginRight: 24 }}
          />

          {(price || priceChange) && (
            <div style={{ textAlign: "right" }}>
              <Quote
                inline={true}
                price={formattedPrice === "$NaN" ? price : formattedPrice}
                netChangePercent={priceChange}
                textSize="small"
              />
            </div>
          )}
        </div>
        {children && (
          <>
            <Divider style={{ marginTop: 5, marginBottom: 10 }} />
            <Typography.Paragraph>{children}</Typography.Paragraph>
          </>
        )}
        {(stats || actions) && (
          <>
            <Divider style={{ marginTop: 0, marginBottom: 12 }} />
            <Row align="bottom" gutter={20}>
              <Col span={24} style={{ marginBottom: isMobile ? 0 : 24 }}>
                {stats}
              </Col>
              <Col span={24} style={{ textAlign: "right" }}>
                {actions}
              </Col>
            </Row>
          </>
        )}
      </Card>
    </div>
  );

  return badge ? (
    <Badge.Ribbon text={badge} color={badgeColor}>
      {inner}
    </Badge.Ribbon>
  ) : (
    inner
  );
}
