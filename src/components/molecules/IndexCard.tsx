import { Card, CardProps, Divider, Space, Typography } from "antd";
import { ReactNode, useMemo } from "react";
import { useBreakpoints } from "helpers";
import noop from "lodash.noop";

type IndexCardAction = {
  title?: ReactNode;
  value: ReactNode;
};

interface Props extends CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  titleExtra?: ReactNode;
  actions?: IndexCardAction[];
  direction?: "horizontal" | "vertical";
  onClick?(): void;
}

export default function IndexCard({
  title,
  subtitle,
  titleExtra,
  actions = [],
  onClick = noop,
  direction = "horizontal",
  children,
  ...rest
}: Props) {
  const { isMobile } = useBreakpoints();

  const formattedActions = useMemo(() => {
    return direction === "vertical"
      ? [
          <Space key="1" direction="vertical">
            {actions.map((action, index) => {
              const isLastAction = index === actions.length - 1;

              return (
                <div key={index}>
                  {action.title && (
                    <Typography.Text type="secondary">
                      {action.title}
                    </Typography.Text>
                  )}
                  <Typography.Title
                    level={4}
                    style={{
                      margin: 0,
                      marginRight: 10,
                      marginLeft: 10,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {action.value}
                  </Typography.Title>
                  {!isLastAction && (
                    <Divider style={{ marginTop: 10, marginBottom: 0 }} />
                  )}
                </div>
              );
            })}
          </Space>,
        ]
      : actions.map((action, index) => (
          <div key={index}>
            {action.title && (
              <Typography.Text type="secondary">{action.title}</Typography.Text>
            )}
            <Typography.Title
              level={4}
              style={{
                margin: 0,
              }}
            >
              {action.value}
            </Typography.Title>
          </div>
        ));
  }, [actions, direction]);

  return (
    <Card
      onClick={onClick}
      hoverable={onClick !== noop}
      title={
        <Space
          align="start"
          direction={direction}
          className="spaced-between"
          style={{ width: "100%", textAlign: "center" }}
        >
          <div>
            {subtitle && (
              <Typography.Title
                type="secondary"
                level={isMobile ? 5 : 3}
                style={{
                  marginBottom: 0,
                }}
              >
                {subtitle}
              </Typography.Title>
            )}
            <Typography.Title
              className="no-margin-bottom"
              level={isMobile ? 5 : 2}
              style={{
                marginTop: 0,
                marginBottom: 0,
              }}
            >
              {title}
            </Typography.Title>
          </div>
          <div>{titleExtra}</div>
        </Space>
      }
      actions={formattedActions}
      {...rest}
    >
      <div className="perfectly-centered">{children}</div>
    </Card>
  );
}
