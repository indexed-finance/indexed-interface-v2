import { CategoryCard, CategoryDropdown, ScreenHeader } from "components";
import { Link } from "react-router-dom";
import { Space } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";

interface Props {
  withBreadcrumb?: boolean;
}

export default function CategoryList({ withBreadcrumb = true }: Props) {
  const categories = useSelector(selectors.selectAllFormattedCategories);
  const headerProps = withBreadcrumb
    ? {
        overlay: <CategoryDropdown />,
        activeBreadcrumb: <Link to="/categories">Categories</Link>,
      }
    : {};

  return (
    <>
      <ScreenHeader title="Categories" {...headerProps} />
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
