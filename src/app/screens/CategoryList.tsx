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
    <div className="CategoryList">
      <ScreenHeader title="Categories" {...headerProps} />
      <Space direction="vertical" size="large">
        {categories.map((category) => (
          <CategoryCard key={category!.id} {...category!} />
        ))}
      </Space>
    </div>
  );
}
