import { CategoryCard, CategoryDropdown, ScreenHeader } from "components";
import { Link } from "react-router-dom";
import { Space } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";
import React from "react";
import styled from "styled-components";

export default function CategoryList() {
  const categories = useSelector(selectors.selectAllFormattedCategories);

  return (
    <>
      <ScreenHeader
        title="Categories"
        overlay={<CategoryDropdown />}
        activeBreadcrumb={<Link to="/categories">Categories</Link>}
      />
      <S.Space wrap={true} size="large" align="start">
        {categories.map((category) => (
          <CategoryCard key={category!.id} {...category!} />
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
};
