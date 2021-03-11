import { Link } from "react-router-dom";
import { Menu } from "antd";
import { Token } from "components/atoms";
import { selectors } from "features";
import { useSelector } from "react-redux";

export default function CategoryDropdown() {
  const { categories } = useSelector(selectors.selectMenuModels);

  return (
    <Menu>
      {categories.map(({ id, name, symbol, slug }) => {
        return (
          <Menu.Item key={id}>
            <Link to={`/categories/${slug}`}>
              <div>
                <Token address={id} name={symbol} image={symbol} />
                <span>{name}</span>
              </div>
            </Link>
          </Menu.Item>
        );
      })}
    </Menu>
  );
}
