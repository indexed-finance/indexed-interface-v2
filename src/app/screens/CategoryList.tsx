import { CategoryCard, CategoryDropdown, ScreenHeader } from "components";
import { Link } from "react-router-dom";
import { Space } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";
import React from "react";
import styled, { css } from "styled-components";

interface Props {
  centered?: boolean;
  withBreadcrumb?: boolean;
}

export default function CategoryList({
  centered = false,
  withBreadcrumb = true,
}: Props) {
  const categories = useSelector(selectors.selectAllFormattedCategories);
  const headerProps = withBreadcrumb
    ? {
        overlay: <CategoryDropdown />,
        activeBreadcrumb: <Link to="/categories">Categories</Link>,
      }
    : {};

  return (
    <S.CategoryList centered={centered}>
      <ScreenHeader title="Categories" {...headerProps} />
      <S.Space wrap={true} size="large" align={centered ? "center" : "start"}>
        {categories.map((category) => (
          <CategoryCard key={category!.id} {...category!} />
        ))}
      </S.Space>
    </S.CategoryList>
  );
}

const S = {
  CategoryList: styled.div<{ centered?: boolean }>`
    ${(props) =>
      props.centered &&
      css`
        h1 > span {
          width: 100%;
          text-align: center;
        }
      `}
  `,
  Space: styled(Space)`
    .ant-space-item {
      flex: 1;
    }

    ${(props) =>
      props.align === "center" &&
      css`
        justify-content: space-around;
      `}
  `,
};
