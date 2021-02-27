import "theme/styles.less";
import { Affix, Breadcrumb, Grid, Layout, Select, Switch } from "antd";
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import {
  Button,
  Drawer,
  DrawerContext,
  PageFooter,
  QuoteCarousel,
} from "components";
import { FormattedIndexPool, selectors } from "features";
import { GlobalStyles } from "theme";
import { Link, Route, Switch as RouterSwitch } from "react-router-dom";
import { Logo } from "components";
import { MdAccountBalanceWallet, MdSettings } from "react-icons/md";
import { SOCIAL_MEDIA } from "config";
import { useSelector } from "react-redux";
import { useTranslation } from "i18n";
import AppMenu from "./AppMenu";
import React, { useCallback, useContext, useState } from "react";
import routes from "./routes";
import styled from "styled-components";

const { useBreakpoint } = Grid;
const { Sider, Header, Content } = Layout;
const { Option } = Select;

export default function AppLayout() {
  const translate = useTranslation();
  const { activePage } = useContext(DrawerContext);
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);
  const breakpoint = useBreakpoint();
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const MobileMenuIcon = mobileMenuActive ? S.MenuFold : S.MenuUnfold;
  const closeMobileMenu = useCallback(() => setMobileMenuActive(false), []);
  const toggleMobileMenu = useCallback(
    () => setMobileMenuActive((prev) => !prev),
    []
  );

  return (
    <>
      <GlobalStyles />
      <S.Layout className="layout">
        {breakpoint.lg ? (
          // Desktop  sider
          <S.Sider width={300}>
            <Logo />
            <QuoteCarousel pools={indexPools as FormattedIndexPool[]} />
            <AppMenu />
          </S.Sider>
        ) : (
          // Mobile header
          <>
            <S.Header>
              <MobileMenuIcon onClick={toggleMobileMenu} />
              <Logo />
            </S.Header>
            {mobileMenuActive && (
              <S.MobileMenu>
                <S.AppMenu onItemClick={closeMobileMenu} />
              </S.MobileMenu>
            )}
          </>
        )}
        <Content>
          <S.Top>
            {breakpoint.lg && (
              <S.Controls>
                <S.Select defaultValue="Language: English" bordered={false}>
                  <Option value="english">English</Option>
                </S.Select>
                <Switch checked={true} />
                <S.Wallet type="ghost">
                  <MdAccountBalanceWallet />
                </S.Wallet>
                <S.Settings type="ghost">
                  <Link to="/settings">
                    <MdSettings />
                  </Link>
                </S.Settings>
              </S.Controls>
            )}
          </S.Top>
          <S.Page extraPadded={breakpoint.sm}>
            <RouterSwitch>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} exact={route.exact}>
                  {route.screen}
                </Route>
              ))}
            </RouterSwitch>

            {activePage && <Drawer page={activePage} />}
          </S.Page>

          <PageFooter
            left={<S.Rights>{translate("ALL_RIGHTS_RESERVED")}</S.Rights>}
            right={
              <Button.Group>
                {SOCIAL_MEDIA.map((socialMedia) => (
                  <Button
                    key={socialMedia.name}
                    type="link"
                    href={socialMedia.link}
                  >
                    <S.SocialMediaImage
                      src={
                        require(`assets/images/${socialMedia.image}`).default
                      }
                    />
                  </Button>
                ))}
              </Button.Group>
            }
          ></PageFooter>
        </Content>
      </S.Layout>
    </>
  );
}

const S = {
  Affix: styled(Affix)`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  `,
  Layout: styled(Layout)``,
  SocialMediaImage: styled.img`
    ${(props) => props.theme.snippets.size32};
    ${(props) => props.theme.snippets.circular};
  `,
  Rights: styled.div`
    margin-top: ${(props) => props.theme.spacing.small};
  `,
  Page: styled.div<{ extraPadded?: boolean }>`
    padding: ${(props) =>
      props.extraPadded
        ? props.theme.spacing.large
        : props.theme.spacing.small};
    ${(props) => props.theme.snippets.dropshadow};
    position: relative;
    padding-top: 112px;
  `,
  Breadcrumb: styled(Breadcrumb)`
    flex: 1;
  `,
  Top: styled(Header)`
    ${(props) => props.theme.snippets.spacedBetween};
    margin-bottom: ${(props) => props.theme.spacing.large};
    position: fixed;
    top: 0;
    height: 64px;
    width: calc(100% - 299px);
    left: 298px;
    z-index: 2;
  `,
  Controls: styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  `,
  Select: styled(Select)`
    width: 160px;
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
  Wallet: styled(Button)`
    ${(props) => props.theme.snippets.perfectlyCentered};
    font-size: ${(props) => props.theme.fontSizes.huge};
    margin-left: ${(props) => props.theme.spacing.medium};
  `,
  Settings: styled(Button)`
    font-size: ${(props) => props.theme.fontSizes.huge};
    margin-left: ${(props) => props.theme.spacing.medium};
    ${(props) => props.theme.snippets.perfectlyCentered};

    a {
      ${(props) => props.theme.snippets.perfectlyCentered};
    }
  `,
  Header: styled(Header)`
    top: 0;
    ${(props) => props.theme.snippets.spacedBetween};
    z-index: 4;
    padding-right: 0;
    padding-left: 12px;
  `,
  AppMenu: styled(AppMenu)`
    position: fixed;
    top: 65px;
    left: 0;
    z-index: 2;
  `,
  MenuFold: styled(AiOutlineMenuFold)`
    font-size: 24px;
  `,
  MenuUnfold: styled(AiOutlineMenuUnfold)`
    font-size: 24px;
  `,
  MobileMenu: styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: calc(100vw + 1px);
    height: 100vh;
    z-index: 2;
  `,
  Sider: styled(Sider)`
    height: 100vh;

    .ant-layout-sider-children {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      width: 299px;
      background: #111;
      overflow: auto;

      .ant-menu-sub {
        max-height: 300px;
        overflow: auto;
      }
    }
  `,
};
