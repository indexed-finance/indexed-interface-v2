import { Link } from "react-router-dom";
import { Menu } from "antd";
import { Token } from "components/atoms";
import { selectors } from "features";
import { useSelector } from "react-redux";

export default function PoolDropdown() {
  const { indexPools } = useSelector(selectors.selectMenuModels);
  const indexPoolsLookup = useSelector(selectors.selectCategoryImagesByPoolIds);

  return (
    <Menu>
      {indexPools.map(({ id, name, slug }) => {
        const image = indexPoolsLookup[id];

        return (
          <Menu.Item key={id}>
            <Link to={`/pools/${slug}`}>
              <div>
                <Token address={id} name={name} image={image} />
                <span>{name}</span>
              </div>
            </Link>
          </Menu.Item>
        );
      })}
    </Menu>
  );
}
