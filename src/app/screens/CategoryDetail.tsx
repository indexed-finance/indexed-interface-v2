import { AppState, selectors } from "features";
import { CategoryDropdown, CategoryTable, ScreenHeader } from "components";
import { Divider } from "antd";
import { Link } from "react-router-dom";
import { Redirect, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import React from "react";
import ReactMarkdown from "react-markdown";

export default function CategoryDetail() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const category = useSelector((state: AppState) =>
    selectors.selectFormattedCategory(state, categoryName)
  );

  return category ? (
    <>
      <ScreenHeader
        title={category.name}
        overlay={<CategoryDropdown />}
        activeBreadcrumb={<Link to="/categories">Categories</Link>}
      />
      <CategoryTable pools={category.indexPools} />
      <Divider />
      <ReactMarkdown>{category.description}</ReactMarkdown>
    </>
  ) : (
    <Redirect to="/categories" />
  );
}
