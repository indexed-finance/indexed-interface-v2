import { AppState, selectors } from "features";
import { CategoryDropdown, CategoryTable, ScreenHeader } from "components";
import { Divider, Typography } from "antd";
import { Link } from "react-router-dom";
import { Redirect, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslator } from "hooks";
import ReactMarkdown from "react-markdown";

export default function CategoryDetail() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const category = useSelector((state: AppState) =>
    selectors.selectFormattedCategory(state, categoryName)
  );
  const tx = useTranslator();

  return category ? (
    <>
      <ScreenHeader
        title={category.name}
        overlay={<CategoryDropdown />}
        activeBreadcrumb={<Link to="/categories">{tx("CATEGORIES")}</Link>}
      />
      <CategoryTable pools={category.indexPools} />
      <Divider />
      <Typography.Text>
        <ReactMarkdown>{category.description}</ReactMarkdown>
      </Typography.Text>
    </>
  ) : (
    <Redirect to="/categories" />
  );
}
