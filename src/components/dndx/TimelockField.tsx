import { Card, Typography } from "antd";
import { ReactNode } from "react";

export function TimelockField({
  title,
  description = "",
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card
      style={{ background: "#232323", marginBottom: 24 }}
      hoverable={false}
      bordered={false}
      title={
        <>
          <Typography.Title
            level={2}
            type="warning"
            style={{
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.2ch",
            }}
          >
            {title}
          </Typography.Title>
          {description && (
            <Typography.Title level={4} style={{ margin: 0 }}>
              {description}
            </Typography.Title>
          )}
        </>
      }
    >
      {children}
    </Card>
  );
}
