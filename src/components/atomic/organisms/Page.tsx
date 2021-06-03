import { BugReportLink } from "components/atomic/atoms";
import { Button, Card, PageHeader, Space, Typography } from "antd";
import { LegacySiteLink } from "components/atomic/molecules";
import { ReactNode } from "react";
import { RiCopyrightLine } from "react-icons/ri";
import { useBreakpoints } from "hooks";
import { useHistory } from "react-router-dom";

interface Props {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  hasPageHeader: boolean;
}

export function Page({
  hasPageHeader = true,
  title = null,
  subtitle = null,
  extra = null,
  actions = null,
  children = null,
}: Props) {
  const { isMobile } = useBreakpoints();
  const { goBack } = useHistory();

  return (
    <div
      style={{
        width: isMobile ? "96vw" : "80vw",
        maxWidth: isMobile ? "initial" : 1200,
        minHeight: "100vh",
        margin: isMobile ? "6rem auto 8rem auto" : "8rem auto 8rem auto",
        paddingBottom: "8rem",
        background: "#151515",
        position: "relative",
      }}
    >
      <Card
        bordered={false}
        headStyle={{ padding: 0 }}
        bodyStyle={{
          padding: isMobile ? "24px 12px" : 24,
          marginTop: -9,
        }}
        title={
          hasPageHeader ? (
            <PageHeader
              style={{
                color: "white",
                borderBottom: "1px solid #49ffff",
                paddingBottom: 18,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onBack={goBack}
              title={
                <Typography.Title
                  level={isMobile ? 5 : 2}
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
          ) : null
        }
      >
        {children}
        {actions && (
          <div
            style={{
              position: "fixed",
              top: 60,
              right: -60,
              background: "#111",
              borderBottom: "1px solid rgba(47, 206, 252, 0.4)",
              borderLeft: "1px solid rgba(47, 206, 252, 0.4)",
              borderBottomLeftRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              zIndex: 1,
            }}
          >
            {actions}
          </div>
        )}
      </Card>
      <Space
        size="large"
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
        }}
      >
        <div>
          <RiCopyrightLine
            style={{ position: "relative", top: 2, textTransform: "uppercase" }}
          />{" "}
          Indexed 2021
        </div>
        <Button.Group>
          <LegacySiteLink />
          <BugReportLink />
        </Button.Group>
      </Space>
    </div>
  );
}
