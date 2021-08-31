import { Divider, Space, Typography } from "antd";
import { ReactNode } from "react";

export function PortfolioSection({
  title,
  walletUsdValue,
  accruedUsdValue,
  children,
}: {
  title: ReactNode;
  walletUsdValue: string;
  accruedUsdValue?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 48 }}>
      <Typography.Title
        level={1}
        type="warning"
        style={{ margin: 0, textTransform: "uppercase" }}
      >
        {title}
      </Typography.Title>
      <Divider orientation="right">
        <Space>
          <Typography.Title
            level={3}
            type="success"
            style={{ textAlign: "right", margin: 0 }}
          >
            {walletUsdValue}
          </Typography.Title>
          {accruedUsdValue && (
            <>
              {" / "}
              <Typography.Title
                level={3}
                type="danger"
                style={{ textAlign: "right", margin: 0 }}
              >
                {accruedUsdValue}
              </Typography.Title>
            </>
          )}
        </Space>
      </Divider>

      {children}
    </div>
  );
}
