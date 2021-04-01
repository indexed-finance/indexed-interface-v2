import { CategoryCard, CategoryDropdown, ScreenHeader } from "components";
import { Link } from "react-router-dom";
import { Space } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";
import { useTranslator } from "hooks";

interface Props {
  withBreadcrumb?: boolean;
}

export default function CategoryList({ withBreadcrumb = true }: Props) {
  const tx = useTranslator();
  const categories = useSelector(selectors.selectAllFormattedCategories);
  const headerProps = withBreadcrumb
    ? {
        overlay: <CategoryDropdown />,
        activeBreadcrumb: <Link to="/categories">{tx("CATEGORIES")}</Link>,
      }
    : {};

  return (
    <>
      <ScreenHeader title={tx("CATEGORIES")} {...headerProps} />
      <Space size="large" style={{ width: "100%" }} wrap={true}>
        {categories.map((category) => (
          <div style={{ flex: "1 1 50%" }} key={category!.id}>
            <CategoryCard {...category!} />
          </div>
        ))}
      </Space>
    </>
  );
}
