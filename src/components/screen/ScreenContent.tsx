import { Divider, PageHeader, Space, Typography } from "antd";
import { Logo } from "components/atomic";
import { Route, useHistory } from "react-router-dom";
import { ScreenContext } from "./ScreenProvider";
import { Suspense, useContext } from "react";
import { routes } from "./routes";

export function ScreenContent() {
  const { goBack } = useHistory();
  const { title, subtitle, extra, actions, hasPageHeader } = useContext(
    ScreenContext
  );

  return (
    <div
      style={{
        background: "rgba(0, 0, 0, 0.65)",
        borderTop: "1px solid rgba(255, 255, 255, 0.65)",
        borderRight: "1px solid rgba(255, 255, 255, 0.65)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.65)",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        width: "80vw",
        minHeight: "100vh",
        margin: "8rem auto 0 auto",
        padding: 24,
      }}
    >
      {hasPageHeader && (
        <>
          <Space
            style={{
              width: "100%",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <PageHeader
              onBack={goBack}
              title={
                <div style={{ marginLeft: 12 }}>
                  <Typography.Title
                    level={2}
                    style={{ margin: 0, textTransform: "uppercase" }}
                  >
                    {title}
                  </Typography.Title>
                  {subtitle && (
                    <>
                      <br />
                      <Typography.Text style={{ fontSize: 18, margin: 0 }}>
                        {subtitle}
                      </Typography.Text>
                    </>
                  )}
                </div>
              }
              style={{ color: "white" }}
            />
            {extra && <div>{extra}</div>}
          </Space>
          <Divider style={{ margin: 0 }} />
        </>
      )}
      <div style={{ padding: "2rem 3rem 10rem 3rem" }}>
        <Suspense
          fallback={
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Logo withTitle={false} spinning={true} />
            </div>
          }
        >
          {routes.map((route, index) => (
            <Route key={index} exact={true} {...route} />
          ))}
        </Suspense>
      </div>
      <Divider />
      {actions && (
        <div
          style={{
            position: "fixed",
            bottom: 77,
            left: 0,
            width: "100vw",
            height: 45,
            background: "rgba(0, 0, 0, 0.65)",
            borderTop: "1px solid rgba(255, 255, 255, 0.65)",
            display: "flex",
            alignItems: "center",
            padding: "12px 50px",
            zIndex: 1,
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
