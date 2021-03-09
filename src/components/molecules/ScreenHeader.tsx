import { Area } from "components/atoms";
import { Breadcrumb, Divider, Grid, Typography } from "antd";
import React, { ReactElement } from "react";
import styled, { css } from "styled-components";

interface Props {
  title?: string;
  overlay?: ReactElement;
  activeBreadcrumb?: ReactElement;
}

const { useBreakpoint } = Grid;

export default function ScreenHeader(props: Props) {
  const breakpoints = useBreakpoint();
  const title = props.title ? props.title.replace(/ Tokens Index/g, "") : "";

  return (
    <>
      <S.Title
        level={breakpoints.md ? 1 : 3}
        withMargin={!breakpoints.sm}
        centered={!breakpoints.sm}
      >
        <Area>
          <S.TitleInner>{title}</S.TitleInner>
        </Area>
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
  Title: styled(({ withMargin: _, centered: __, ...rest }) => (
    <Typography.Title {...rest} />
  ))<{ withMargin?: boolean; centered?: boolean }>`
    ${(props) => props.theme.snippets.spacedBetween};
    align-items: flex-end;

    ${(props) =>
      props.withMargin &&
      css`
        margin-top: ${(props) => props.theme.spacing.huge};
      `}
    ${(props) =>
      props.centered &&
      css`
        text-align: center;
      `}
  `,
  TitleInner: styled.span`
    ${(props) => props.theme.snippets.fancy};
  `,
};
