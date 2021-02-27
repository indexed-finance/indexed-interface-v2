import { Link } from "react-router-dom";
import { Menu, Typography } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";
import styled from "styled-components";

export default function CategoryDropdown() {
  const { categories } = useSelector(selectors.selectMenuModels);

  return (
    <Menu>
      {categories.map(({ id, name }) => {
        return (
          <Menu.Item key={id}>
            <Link to={`/categories/${id}`}>
              <S.ItemInner>
                <S.CategoryId level={3} data-category={true}>
                  {id}
                </S.CategoryId>
                <span>{name}</span>
              </S.ItemInner>
            </Link>
          </Menu.Item>
        );
      })}
    </Menu>
  );
}

const S = {
  CategoryId: styled(Typography.Title)`
    position: relative;
    left: 9px;
    opacity: 0.2;
    text-transform: lowercase;

    transition: color 0.6s linear;
  `,
  ItemInner: styled.div<{ isCategory?: boolean }>`
    ${(props) => props.theme.snippets.perfectlyAligned};

    :hover {
      [data-category="true"] {
        opacity: 0.6;
        color: #ccccff;
      }
    }
  `,
};
