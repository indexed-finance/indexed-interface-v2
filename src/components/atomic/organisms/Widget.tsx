import { Col, Divider, Row, Space, Typography } from "antd";
import { Quote } from "components/atomic/molecules";
import { ReactNode } from "react";
import { Token } from "components/atomic/atoms";
import noop from "lodash.noop";

interface Props {
  symbol: string;
  address: string;
  price: string;
  priceChange: string;
  width: number;
  children?: ReactNode;
  stats?: ReactNode;
  actions?: ReactNode;
  onClick?(): void;
}

export function Widget({
  symbol,
  address,
  price,
  priceChange,
  width,
  children = null,
  stats = null,
  actions = null,
  onClick = noop,
}: Props) {
  return (
    <div
      onClick={onClick}
      role="button"
      style={{ cursor: onClick === noop ? "initial" : "pointer", width }}
    >
      <Space
        direction="vertical"
        style={{
          borderRadius: "1.4rem",
          border: "1px solid rgba(255,255,255,0.65)",
          padding: "1rem",
          background: "rgba(0,0,0,0.65)",
          width,
        }}
      >
        <Space>
          <Token name={symbol} address={address} image="" size="large" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Typography.Title level={2} style={{ margin: 0 }}>
              {symbol}
            </Typography.Title>
            <Space size="small" style={{ margin: 0 }}>
              <Quote
                inline={true}
                price={price}
                netChangePercent={priceChange}
              />
            </Space>
          </div>
        </Space>
        {children && <Typography.Paragraph>{children}</Typography.Paragraph>}
        {(stats || actions) && (
          <>
            <Divider style={{ marginTop: 0, marginBottom: 12 }} />
            <Row align="bottom">
              <Col span={12}>{stats}</Col>
              <Col span={12} style={{ textAlign: "right" }}>
                {actions}
              </Col>
            </Row>
          </>
        )}
      </Space>
    </div>
  );
}
