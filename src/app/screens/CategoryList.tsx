import { Breadcrumb, Grid, Space, Typography } from "antd";
import { CategoryCard, CategoryDropdown } from "components";
import { Link } from "react-router-dom";
import { selectors } from "features";
import { useSelector } from "react-redux";
import React from "react";
import styled from "styled-components";

const { useBreakpoint } = Grid;

export default function CategoryList() {
  const categories = useSelector(selectors.selectAllFormattedCategories);
  const breakpoints = useBreakpoint();

  return (
    <>
      <S.Title
        level={breakpoints.md ? 1 : 3}
        withMargin={!breakpoints.sm}
        centered={!breakpoints.sm}
      >
        <span>Categories</span>
        <Breadcrumb>
          <Breadcrumb.Item overlay={<CategoryDropdown />}>
            <Link to="/categories">Categories</Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      </S.Title>
      <S.Space wrap={true} size="large" align="start">
        {categories.map((category) => (
          <CategoryCard key={category!.id} {...category} />
        ))}
      </S.Space>
    </>
  );
}

const S = {
  Space: styled(Space)`
    .ant-space-item {
      flex: 1;
    }
  `,
  Title: styled(({ withMargin: _, centered: __, ...rest }) => (
    <Typography.Title {...rest} />
  ))<{ withMargin?: boolean; centered?: boolean }>`
    ${(props) => props.theme.snippets.spacedBetween};
  `,
};
