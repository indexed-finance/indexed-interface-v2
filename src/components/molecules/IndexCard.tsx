import { Card, CardProps, Divider, Space, Typography } from "antd";
import { ReactNode, useMemo } from "react";
import { useBreakpoints } from "hooks";
import noop from "lodash.noop";

type IndexCardAction = {
  title?: ReactNode;
  value: ReactNode;
};

interface Props extends CardProps {
  title?: ReactNode;
  titleStyle?: any;
  subtitle?: ReactNode;
  titleExtra?: ReactNode;
  actions?: IndexCardAction[];
  direction?: "horizontal" | "vertical";
  centered?: boolean;
  onClick?(): void;
}

export function IndexCard({
  title,
  titleStyle = {},
  subtitle,
  titleExtra,
  actions = [],
  onClick = noop,
  direction = "horizontal",
  children,
  centered = true,
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
      className="IndexCard"
      onClick={onClick}
      hoverable={onClick !== noop}
      title={
        <Space
          direction={direction}
          className={titleExtra ? "spaced-between" : "perfectly-centered"}
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
            {title && (
              <Typography.Title
                className="no-margin-bottom"
                level={isMobile ? 5 : 2}
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                  ...titleStyle,
                }}
              >
                {title}
              </Typography.Title>
            )}
          </div>
          {titleExtra && <div>{titleExtra}</div>}
        </Space>
      }
      actions={formattedActions}
      {...rest}
    >
      {children && (
        <div className={centered ? "perfectly-centered" : ""}>{children}</div>
      )}
    </Card>
  );
}
