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
      style={{ background: "#232323", marginBottom: 24, padding: 12 }}
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
              whiteSpace: "pre-wrap",
            }}
          >
            {title}
          </Typography.Title>
          {description && (
            <Typography.Title
              level={4}
              style={{ margin: 0, whiteSpace: "pre-wrap" }}
            >
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
