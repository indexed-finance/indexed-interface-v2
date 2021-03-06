import { AiOutlineCopyrightCircle } from "react-icons/ai";
import { Link, useHistory } from "react-router-dom";
import { Menu, Typography } from "antd";
import { PLACEHOLDER_TOKEN_IMAGE } from "config";
import { SOCIAL_MEDIA } from "config";
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
    <>
      <S.Menu
        theme="dark"
        mode="inline"
        defaultOpenKeys={["Social"]}
        selectable={false}
        {...rest}
      >
        {routes
          .filter((route) => route.sider)
          .map((route) => {
            if (route.model) {
              const models =
                menuModels[
                  route.model as "categories" | "indexPools" | "tokens"
                ];

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
                          <S.Uppercase>{model.name}</S.Uppercase>
                        </S.ItemInner>
                      </Item>
                    );
                  })}
                </SubMenu>
              );
            } else {
              return (
                <S.Item key={route.path} onClick={onItemClick}>
                  {route.isExternalLink ? (
                    route.sider
                  ) : (
                    <Link to={route.path}>{route.sider}</Link>
                  )}
                </S.Item>
              );
            }
          })}
        {/* Static */}
        <SubMenu key="Social" title={<S.Title>Social</S.Title>}>
          {SOCIAL_MEDIA.map((site) => (
            <Menu.Item key={site.name}>
              <S.Uppercase
                href={site.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <S.Image
                  alt={site.name}
                  src={require(`assets/images/${site.image}`).default}
                />{" "}
                {site.name}
              </S.Uppercase>
            </Menu.Item>
          ))}
        </SubMenu>
      </S.Menu>
      <S.PerfectlyCentered>
        <S.Copyright level={4}>
          <AiOutlineCopyrightCircle /> 2021 Indexed
        </S.Copyright>
      </S.PerfectlyCentered>
    </>
  );
}

const S = {
  Menu: styled(Menu)`
    height: 75%;
    max-width: 100vw;
    overflow: auto;
  `,
  Item: styled(Item)`
    ${(props) => props.theme.snippets.fancy};
  `,
  ItemInner: styled.div<{ isCategory?: boolean }>`
    ${(props) => props.theme.snippets.spacedBetween};

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
    ${(props) => props.theme.snippets.circular};
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
  Title: styled.span`
    ${(props) => props.theme.snippets.fancy};
  `,
  Uppercase: styled.a`
    text-align: right;
    text-transform: uppercase;
  `,
  PerfectlyCentered: styled.div`
    ${(props) => props.theme.snippets.perfectlyCentered};
    padding-top: 6px;
    padding-bottom: 6px;
    background: #202020;
  `,
  Copyright: styled(Typography.Title)`
    ${(props) => props.theme.snippets.fancy};
    ${(props) => props.theme.snippets.perfectlyAligned};
    margin-bottom: 0 !important;

    svg {
      margin-right: ${(props) => props.theme.spacing.small};
      margin-bottom: 3px;
    }
  `,
};
