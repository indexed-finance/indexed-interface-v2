import { Link, useHistory } from "react-router-dom";
import { Menu } from "antd";
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
  const history = useHistory();

  return (
    <S.Menu theme="dark" mode="inline" {...rest}>
      {routes
        .filter((route) => route.sider)
        .map((route) => {
          if (route.model) {
            const models =
              menuModels[route.model as "categories" | "indexPools"];

            return (
              <SubMenu
                key={route.path}
                title={
                  <Link to={route.path} onClick={onItemClick}>
                    {route.sider}
                  </Link>
                }
              >
                {models.map((model) => (
                  <Item
                    key={model.id}
                    onClick={() => {
                      history.push(`${route.path}/${model.id}`);
                      onItemClick();
                    }}
                  >
                    {model.name}
                  </Item>
                ))}
              </SubMenu>
            );
          } else {
            return (
              <Item key={route.path} onClick={onItemClick}>
                <Link to={route.path}>{route.sider}</Link>
              </Item>
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
};
