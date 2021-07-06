import { Card, Col, Row, Tooltip, Typography } from "antd";
import { Token } from "components/atomic";
import { useHistory } from "react-router";

export function VaultCard({
  withTitle,
  ...rest
}: { withTitle?: boolean } & any) {
  const { push } = useHistory();

  return (
    <Card
      hoverable={true}
      style={{ position: "relative", overflow: "hidden" }}
      onClick={() => push("/vaults/1")}
      {...rest}
    >
      {withTitle && (
        <Row>
          <Col xs={24} md={6} style={{ textAlign: "left" }}>
            <Typography.Title level={2}>Uniswap</Typography.Title>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Typography.Title level={2}>TVL</Typography.Title>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Typography.Title level={2}>APR</Typography.Title>
          </Col>
        </Row>
      )}
      <Row align="middle">
        <Col xs={24} md={6}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            <Token symbol="UNI" name="Uniswap" size="large" />
          </Typography.Title>
        </Col>
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            $50.2M
          </Typography.Title>
        </Col>
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          <Tooltip title="Annualized based on the current interest rate.">
            <Typography.Title level={3} style={{ margin: 0 }} type="success">
              43.0%
            </Typography.Title>
          </Tooltip>
        </Col>
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          <Token
            symbol="SUSHI"
            name="Sushiswap"
            showSymbol={false}
            showName={false}
            size="large"
          />
        </Col>
      </Row>
    </Card>
  );
}
