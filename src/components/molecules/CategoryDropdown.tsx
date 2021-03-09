import { Link } from "react-router-dom";
import { Menu } from "antd";
import { Token } from "components/atoms";
import { selectors } from "features";
import { useSelector } from "react-redux";
import styled from "styled-components";

export default function CategoryDropdown() {
  const { categories } = useSelector(selectors.selectMenuModels);

  return (
    <Menu>
      {categories.map(({ id, name, symbol, slug }) => {
        return (
          <Menu.Item key={id}>
            <Link to={`/categories/${slug}`}>
              <S.ItemInner>
                <S.Token address={id} name={symbol} image={symbol} />
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
  ItemInner: styled.div<{ isCategory?: boolean }>`
    ${(props) => props.theme.snippets.perfectlyAligned};

    :hover {
      [data-category="true"] {
        opacity: 0.6;
        color: #ccccff;
      }
    }
  `,
  Token: styled(Token)`
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
};
