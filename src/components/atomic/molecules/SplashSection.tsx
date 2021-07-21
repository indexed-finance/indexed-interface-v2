import { Button, Col, Divider, Row, Space, Typography } from "antd";
import { ReactNode } from "react";
import { useBreakpoints } from "hooks";

interface Props {
  title: string;
  catchphrase: string;
  description: string;
  children: ReactNode;
  actionText: string;
  onAction(): void;
  infoText: string;
  onInfo(): void;
}

export function SplashSection({
  title,
  description,
  catchphrase,
  children,
  actionText,
  onAction,
  infoText,
  onInfo,
}: Props) {
  const { isMobile } = useBreakpoints();

  return (
    <Space direction="vertical" style={{ width: "100%", marginBottom: 64 }}>
      <Row align="bottom" justify="space-between">
        <Col span={12}>
          <Typography.Title
            level={1}
            style={{
              textAlign: "left",
              margin: 0,
              color: "rgba(180,180,180,0.4)",
              fontSize: 48,
            }}
          >
            {title}
          </Typography.Title>
          <div
            style={{
              borderLeft: "2px solid #49ffff",
              padding: 10,
              maxWidth: 600,
              marginTop: 12,
              marginBottom: 12,
              background: "rgba(120, 120, 120, 0.1)",
            }}
          >
            {description}
          </div>
        </Col>
        <Col span={12}>
          <Typography.Title level={3} style={{ textAlign: "center" }}>
            <div>
              <Divider className="fancy">{catchphrase}</Divider>
              <Button.Group
                style={{ flexDirection: isMobile ? "column" : "row" }}
              >
                <Button
                  className="plus"
                  type="primary"
                  onClick={onAction}
                  style={{
                    textTransform: "uppercase",
                    fontSize: isMobile ? 16 : 24,
                    width: isMobile ? 160 : "auto",
                    height: "auto",
                    marginRight: isMobile ? 0 : 10,
                    marginBottom: isMobile ? 10 : 0,
                  }}
                >
                  {actionText}
                </Button>
                <Button
                  type="default"
                  onClick={onInfo}
                  style={{
                    fontSize: isMobile ? 16 : 24,
                    width: isMobile ? 160 : "auto",
                    height: "auto",
                    textTransform: "uppercase",
                  }}
                >
                  {infoText}
                </Button>
              </Button.Group>
            </div>
          </Typography.Title>
        </Col>
      </Row>
      {children}
    </Space>
  );
}
