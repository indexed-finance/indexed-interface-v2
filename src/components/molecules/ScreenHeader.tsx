import { Breadcrumb, Divider, Space, Typography } from "antd";
import { ReactElement } from "react";
import { useBreakpoints } from "helpers";

interface Props {
  title?: string;
  overlay?: ReactElement;
  activeBreadcrumb?: ReactElement;
}

export default function ScreenHeader(props: Props) {
  const { isMobile } = useBreakpoints();
  const title = props.title ? props.title.replace(/ Tokens Index/g, "") : "";

  return (
    <>
      <Space
        align="center"
        wrap={true}
        className="spaced-between"
        direction={isMobile ? "vertical" : "horizontal"}
        style={{ padding: 0 }}
      >
        <Typography.Title level={2} className="ScreenHeader">
          {title}
        </Typography.Title>
        {(props.overlay || props.activeBreadcrumb) && (
          <Breadcrumb style={{ fontSize: isMobile ? 14 : 16 }}>
            <Breadcrumb.Item overlay={props.overlay}>
              {props.activeBreadcrumb}
            </Breadcrumb.Item>
            {props.title && <Breadcrumb.Item>{props.title}</Breadcrumb.Item>}
          </Breadcrumb>
        )}
      </Space>
      <Divider dashed={true} />
    </>
  );
}
