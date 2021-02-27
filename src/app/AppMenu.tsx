import { Link, useHistory } from "react-router-dom";
import { Menu, Typography } from "antd";
import { PLACEHOLDER_TOKEN_IMAGE } from "config";
import { selectors } from "features";
import { useSelector } from "react-redux";
import React from "react";
import noop from "lodash.noop";
import routes from "./routes";
import styled from "styled-components";

interface Props {
  onItemClick?(): void;
  className?: string;
}

const { Item, SubMenu } = Menu;

export default function AppMenu({ onItemClick = noop, ...rest }: Props) {
  const menuModels = useSelector(selectors.selectMenuModels);
  const tokenLookup = useSelector(selectors.selectTokenLookup);
  const indexPoolsLookup = useSelector(selectors.selectCategoryImagesByPoolIds);
  const history = useHistory();

  return (
    <S.Menu theme="dark" mode="inline" {...rest}>
      {routes
        .filter((route) => route.sider)
        .map((route) => {
          if (route.model) {
            const models =
              menuModels[route.model as "categories" | "indexPools" | "tokens"];

            return (
              <SubMenu
                key={route.path}
                title={
                  <Link to={route.path} onClick={onItemClick}>
                    <S.Title>{route.sider}</S.Title>
                  </Link>
                }
              >
                {models.map((model) => {
                  let image = "";
                  const isCategory = route.model === "categories";
                  const isIndexPool = route.model === "indexPools";
                  const isToken = route.model === "tokens";

                  if (isIndexPool) {
                    image = indexPoolsLookup[model.id];
                  } else if (isToken) {
                    try {
                      image = require(`assets/images/${
                        tokenLookup[model.id]?.symbol?.toLowerCase() ?? ""
                      }.png`).default;
                    } catch {
                      image = PLACEHOLDER_TOKEN_IMAGE;
                    }
                  }

                  return (
                    <Item
                      key={model.id}
                      onClick={() => {
                        history.push(`${route.path}/${model.id}`);
                        onItemClick();
                      }}
                    >
                      <S.ItemInner isCategory={isCategory}>
                        {isCategory && (
                          <S.CategoryId level={3} data-category={true}>
                            {model.id}
                          </S.CategoryId>
                        )}
                        {(isIndexPool || isToken) && (
                          <S.Image alt={model.name} src={image} />
                        )}

                        <span>{model.name}</span>
                      </S.ItemInner>
                    </Item>
                  );
                })}
              </SubMenu>
            );
          } else {
            return (
              <S.Item key={route.path} onClick={onItemClick}>
                <Link to={route.path}>{route.sider}</Link>
              </S.Item>
            );
          }
        })}
    </S.Menu>
  );
}

const S = {
  Menu: styled(Menu)`
    max-width: 100vw;
  `,
  Item: styled(Item)`
    ${(props) => props.theme.snippets.fancy};
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
  CategoryId: styled(Typography.Title)`
    position: relative;
    left: 9px;
    opacity: 0.2;
    text-transform: lowercase;

    transition: color 0.6s linear;
  `,
  Image: styled.img`
    ${(props) => props.theme.snippets.size32};
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
  Title: styled.span`
    ${(props) => props.theme.snippets.fancy};
  `,
};
