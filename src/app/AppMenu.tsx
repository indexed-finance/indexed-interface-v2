import { Divider, Menu } from "antd";
import {
  LanguageSelector,
  ModeSwitch,
  ServerConnection,
  Token,
} from "components";
import { Link, useHistory } from "react-router-dom";
import { SOCIAL_MEDIA } from "config";
import { selectors } from "features";
import { useBreakpoints } from "helpers";
import { useSelector } from "react-redux";
import React, { useEffect } from "react";
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
  const categoryLookup = useSelector(selectors.selectCategoryLookup);
  const indexPoolsLookup = useSelector(selectors.selectCategoryImagesByPoolIds);
  const history = useHistory();
  const breakpoints = useBreakpoints();
  const isMobile = !breakpoints.md;

  // Effect:
  // In 'xs' and 'sm' modes, the menu is only visible when overlaying the body, so scrolling is confusing.
  useScrollPrevention(isMobile);

  return (
    <>
      <S.Menu
        className="app-menu"
        mode="inline"
        defaultOpenKeys={["Social"]}
        selectable={false}
        {...rest}
      >
        <S.TopItem>
          <S.Aligned>
            <ServerConnection showText={true} />
            <ModeSwitch />
            {isMobile && <LanguageSelector />}
          </S.Aligned>
        </S.TopItem>
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
                      <S.Title>{route.sider}</S.Title>
                    </Link>
                  }
                >
                  {models.map((model) => {
                    const isCategory = route.model === "categories";
                    const isIndexPool = route.model === "indexPools";
                    const image = isIndexPool
                      ? indexPoolsLookup[model.id]
                      : categoryLookup[model.id]?.symbol ?? "";

                    return (
                      <Item
                        key={model.id}
                        onClick={() => {
                          history.push(`${route.path}/${model.slug}`);
                          onItemClick();
                        }}
                      >
                        <S.ItemInner isCategory={isCategory}>
                          <S.Token
                            name={model.name}
                            image={image}
                            address={model.id}
                          />
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
                    <S.SingleLink to={route.path}>
                      <span>{route.sider}</span>
                      {route.icon ?? null}
                    </S.SingleLink>
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
                <S.Token name={site.name} image={site.image} />
                <span className="social-link">{site.name}</span>
              </S.Uppercase>
            </Menu.Item>
          ))}
        </SubMenu>
      </S.Menu>
    </>
  );
}

const S = {
  Menu: styled(Menu)`
    height: calc(100% - 65px);
    max-width: 100vw;
    overflow: hidden;
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
  Token: styled(Token)`
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
  Title: styled.span`
    ${(props) => props.theme.snippets.fancy};
  `,
  Uppercase: styled.a`
    ${(props) => props.theme.snippets.fancy};
    font-size: ${(props) => props.theme.fontSizes.tiny};
    text-align: right;
  `,
  PerfectlyCentered: styled.div`
    ${(props) => props.theme.snippets.perfectlyCentered};
    padding-top: 6px;
    padding-bottom: 6px;
  `,
  SingleLink: styled(Link)`
    ${(props) => props.theme.snippets.spacedBetween};
  `,
  Divider: styled(Divider)`
    margin: 0;
  `,
  TopItem: styled(Item)`
    margin-bottom: 0 !important;
  `,
  Aligned: styled.div`
    ${(props) => props.theme.snippets.spacedBetween};
  `,
};

// #region Helpers
// Code adapted from https://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
function useScrollPrevention(shouldPreventScroll: boolean) {
  useEffect(() => {
    if (shouldPreventScroll) {
      // modern Chrome requires { passive: false } when adding event
      let supportsPassive = false;
      try {
        (window as any).addEventListener(
          "test",
          null,
          Object.defineProperty({}, "passive", {
            get: function () {
              supportsPassive = true;
            },
          })
        );
      } catch {}

      // left: 37, up: 38, right: 39, down: 40,
      // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
      const keys: Record<number, number> = { 37: 1, 38: 1, 39: 1, 40: 1 };
      const preventDefault = (event: Event) => event.preventDefault();
      const preventDefaultForScrollKeys = (
        event: Event & { keyCode: number }
      ) => {
        if (keys[event.keyCode]) {
          preventDefault(event);
          return false;
        }
      };
      const wheelOptions = supportsPassive ? { passive: false } : false;
      const wheelEvent =
        "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

      window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF
      window.addEventListener(wheelEvent, preventDefault, wheelOptions); // modern desktop
      window.addEventListener("touchmove", preventDefault, wheelOptions); // mobile
      window.addEventListener("keydown", preventDefaultForScrollKeys, false);

      return () => {
        window.removeEventListener("DOMMouseScroll", preventDefault, false);
        window.removeEventListener(
          wheelEvent,
          preventDefault,
          wheelOptions as any
        );
        window.removeEventListener(
          "touchmove",
          preventDefault,
          wheelOptions as any
        );
        window.removeEventListener(
          "keydown",
          preventDefaultForScrollKeys,
          false
        );
      };
    }
  }, [shouldPreventScroll]);
}
// #endregion
