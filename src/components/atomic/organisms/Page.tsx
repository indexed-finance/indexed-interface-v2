import { Card, PageHeader, Typography } from "antd";
import { ReactNode } from "react";
import { useBreakpoints } from "hooks";
import { useHistory } from "react-router-dom";
import texture from "theme/images/texture.png";

interface Props {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  hasPageHeader: boolean;
}

export function Page({
  hasPageHeader = true,
  title = null,
  subtitle = null,
  extra = null,
  actions = null,
  children,
}: Props) {
  const { isMobile } = useBreakpoints();
  const { goBack } = useHistory();

  return (
    <div
      style={{
        background: `url(${texture})`,
        width: isMobile ? "96vw" : "80vw",
        maxWidth: 1200,
        minHeight: "100vh",
        margin: "8rem auto 0 auto",
      }}
    >
      <Card
        headStyle={{ padding: 0 }}
        bodyStyle={{
          padding: isMobile ? "24px 12px" : 24,
          marginTop: -9,
          background: `url(${texture})`,
        }}
        title={
          hasPageHeader ? (
            <PageHeader
              style={{
                color: "white",
                borderBottom: "1px solid #FC2FCE",
                width: "100%",
                paddingBottom: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onBack={goBack}
              title={
                <Typography.Title
                  level={2}
                  style={{ margin: 0, textTransform: "uppercase" }}
                >
                  {title}
                  {subtitle && (
                    <>
                      <br />
                      <Typography.Text
                        style={{
                          fontSize: 16,
                          margin: 0,
                          textTransform: "initial",
                        }}
                      >
                        {subtitle}
                      </Typography.Text>
                    </>
                  )}
                </Typography.Title>
              }
            >
              {extra && <div>{extra}</div>}
            </PageHeader>
          ) : (
            <div style={{ paddingBottom: 18 }} />
          )
        }
      >
        {children}
        {actions && (
          <div
            style={{
              position: "fixed",
              top: 60,
              left: 0,
              width: "100vw",
              height: 45,
              background: "rgba(0, 0, 0, 0.65)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.65)",
              display: "flex",
              alignItems: "center",
              padding: "12px 50px",
              zIndex: 1,
            }}
          >
            {actions}
          </div>
        )}
      </Card>
    </div>
  );
}
