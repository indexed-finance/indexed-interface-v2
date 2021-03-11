import { Breadcrumb, Divider, Typography } from "antd";
import { useBreakpoints } from "helpers";
import React, { ReactElement } from "react";

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
      <Typography.Title level={breakpoints.md ? 1 : 3}>
        {title}
        {(props.overlay || props.activeBreadcrumb) && (
          <Breadcrumb>
            <Breadcrumb.Item overlay={props.overlay}>
              {props.activeBreadcrumb}
            </Breadcrumb.Item>
            {props.title && <Breadcrumb.Item>{props.title}</Breadcrumb.Item>}
          </Breadcrumb>
        )}
      </Typography.Title>
      <Divider className="screen-header-divider" />
    </>
  );
}
