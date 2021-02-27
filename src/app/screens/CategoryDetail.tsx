import { AppState, selectors } from "features";
import { Breadcrumb, Grid, Typography } from "antd";
import { CategoryTable } from "components";
import { Link } from "react-router-dom";
import { Redirect, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import React from "react";
import styled, { css } from "styled-components";

const { useBreakpoint } = Grid;

export default function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = useSelector((state: AppState) =>
    selectors.selectFormattedCategory(state, categoryId)
  );
  const breakpoints = useBreakpoint();

  return category ? (
    <>
      <Breadcrumb>
        <Link to="/categories">
          <Breadcrumb.Item>Categories</Breadcrumb.Item>
        </Link>
        <Breadcrumb.Item>{category.name}</Breadcrumb.Item>
      </Breadcrumb>
      <S.Title
        level={breakpoints.md ? 1 : 3}
        withMargin={!breakpoints.sm}
        centered={!breakpoints.sm}
      >
        {category.name}
      </S.Title>
      <CategoryTable {...category} />
    </>
  ) : (
    <Redirect to="/categories" />
  );
}

const S = {
  Title: styled(({ withMargin: _, centered: __, ...rest }) => (
    <Typography.Title {...rest} />
  ))<{ withMargin?: boolean; centered?: boolean }>`
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
};
