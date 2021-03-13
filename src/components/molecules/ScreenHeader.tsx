import { Breadcrumb, Divider, Space, Typography } from "antd";
import { ReactElement } from "react";
import { useBreakpoints } from "helpers";

interface Props {
  title?: string;
  overlay?: ReactElement;
  activeBreadcrumb?: ReactElement;
}

export default function ScreenHeader(props: Props) {
  const breakpoints = useBreakpoints();
  const title = props.title ? props.title.replace(/ Tokens Index/g, "") : "";

  return (
    <>
      <Space align="center" wrap={true} className="spaced-between">
        <Typography.Title
          level={breakpoints.md ? 1 : 3}
          className="ScreenHeader"
        >
          {title}
        </Typography.Title>
        {(props.overlay || props.activeBreadcrumb) && (
          <Breadcrumb style={{ fontSize: 18 }}>
            <Breadcrumb.Item overlay={props.overlay}>
              {props.activeBreadcrumb}
            </Breadcrumb.Item>
            {props.title && <Breadcrumb.Item>{props.title}</Breadcrumb.Item>}
          </Breadcrumb>
        )}
      </Space>
      <Divider className="screen-header-divider" />
    </>
  );
}
