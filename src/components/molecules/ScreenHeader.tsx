import { Breadcrumb, Divider, Typography } from "antd";
import { useBreakpoints } from "helpers";
import React, { ReactElement } from "react";
import styled, { css } from "styled-components";

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
      <S.Title level={breakpoints.md ? 1 : 3} compact={!breakpoints.sm}>
        <S.TitleInner>{title}</S.TitleInner>
        {(props.overlay || props.activeBreadcrumb) && (
          <Breadcrumb>
            <Breadcrumb.Item overlay={props.overlay}>
              {props.activeBreadcrumb}
            </Breadcrumb.Item>
            {props.title && <Breadcrumb.Item>{props.title}</Breadcrumb.Item>}
          </Breadcrumb>
        )}
      </S.Title>
      <Divider className="screen-header-divider" />
    </>
  );
}

const S = {
  Title: styled(({ compact, ...rest }) => <Typography.Title {...rest} />)<{
    compact?: boolean;
  }>`
    ${(props) => props.theme.snippets.spacedBetween};
    align-items: flex-end;
    margin-top: 0 !important;

    ${(props) =>
      props.compact &&
      css`
        display: flex;
        flex-direction: column-reverse;
        text-align: center;
        align-items: center;
        margin-top: ${(props) => props.theme.spacing.huge};

        .ant-breadcrumb {
          margin-bottom: ${(props) => props.theme.spacing.medium};
        }
      `}
  `,
  TitleInner: styled.span`
    ${(props) => props.theme.snippets.fancy};
    font-weight: 200;
    margin-top: 0;
  `,
};
