import "theme/styles.less";
import {
  Affix,
  Breadcrumb,
  Form,
  Grid,
  Layout,
  Popover,
  Select,
  Switch,
  Typography,
} from "antd";
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import {
  Button,
  Drawer,
  DrawerContext,
  PageFooter,
  QuoteCarousel,
} from "components";
import { FormattedIndexPool, actions, selectors } from "features";
import { GlobalStyles } from "theme";
import { ImConnection } from "react-icons/im";
import { Link, Route, Switch as RouterSwitch } from "react-router-dom";
import { Logo } from "components";
import { MdAccountBalanceWallet, MdSettings } from "react-icons/md";
import { SOCIAL_MEDIA } from "config";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "i18n";
import AppMenu from "./AppMenu";
import React, { useCallback, useContext, useMemo, useState } from "react";
import SocketClient from "sockets/client";
import routes from "./routes";
import styled from "styled-components";

const { useBreakpoint } = Grid;
const { Sider, Header, Content } = Layout;
const { Item } = Form;
const { Option } = Select;

export default function AppLayout() {
  const translate = useTranslation();
  const dispatch = useDispatch();
  const { activePage } = useContext(DrawerContext);
  const isConnected = useSelector(selectors.selectConnected);
  const isConnectionEnabled = useSelector(selectors.selectConnectionEnabled);
  const language = useSelector(selectors.selectLanguageName);
  const theme = useSelector(selectors.selectTheme);
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);
  const breakpoint = useBreakpoint();
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const MobileMenuIcon = mobileMenuActive ? S.MenuFold : S.MenuUnfold;
  const closeMobileMenu = useCallback(() => setMobileMenuActive(false), []);
  const toggleMobileMenu = useCallback(
    () => setMobileMenuActive((prev) => !prev),
    []
  );
  const connectionStatus = useMemo(() => {
    if (isConnectionEnabled) {
      return {
        type: (isConnected ? "success" : "danger") as any,
        top: isConnected ? "Connected to server." : "Not connected to server.",
        bottom: "Click this icon to disable socket updates.",
      };
    } else {
      return {
        type: "secondary" as any,
        top: "Connection disabled.",
        bottom: "Click this icon to enable socket updates.",
      };
    }
  }, [isConnectionEnabled, isConnected]);

  // Effect
  // On initial load, open up a connection to the server.
  React.useEffect(() => {
    if (isConnectionEnabled) {
      SocketClient.connect();
    } else {
      SocketClient.disconnect();
    }
  }, [isConnectionEnabled]);

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
                <S.Changeables layout="inline" colon={false}>
                  <Item>
                    <Select value={language}>
                      <Option value="english">English</Option>
                    </Select>
                  </Item>
                  <Item name="Theme">
                    <Switch
                      checked={theme === "dark"}
                      checkedChildren="🌙 Dark Mode"
                      unCheckedChildren="🔆 Light Mode"
                      onClick={() => dispatch(actions.themeToggled())}
                    />
                  </Item>
                  <Item>
                    <S.Wallet type="ghost">
                      <MdAccountBalanceWallet />
                    </S.Wallet>
                  </Item>
                  <Item>
                    <S.Settings type="ghost">
                      <Link to="/settings">
                        <MdSettings />
                      </Link>
                    </S.Settings>
                  </Item>
                  <Item>
                    <Popover
                      placement="bottomLeft"
                      content={
                        <>
                          <strong>{connectionStatus.top}</strong>
                          <br />
                          <em>{connectionStatus.bottom}</em>
                        </>
                      }
                    >
                      <S.Connection>
                        <Typography.Text type={connectionStatus.type}>
                          <S.ConnectionStatus
                            onClick={() =>
                              dispatch(actions.connectionToggled())
                            }
                          />
                        </Typography.Text>
                      </S.Connection>
                    </Popover>
                  </Item>
                </S.Changeables>
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
  Changeables: styled(Form)``,
  Wallet: styled(Button)`
    ${(props) => props.theme.snippets.perfectlyCentered};
    font-size: ${(props) => props.theme.fontSizes.huge};
    margin-left: ${(props) => props.theme.spacing.medium};
  `,
  Settings: styled(Button)`
    font-size: ${(props) => props.theme.fontSizes.huge};
    ${(props) => props.theme.snippets.perfectlyCentered}

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
  Connection: styled.div`
    ${(props) => props.theme.snippets.perfectlyCentered};
    margin: 0;
  `,
  ConnectionStatus: styled(ImConnection)`
    font-size: ${(props) => props.theme.fontSizes.huge};
    cursor: pointer;
    transition: color 0.6s;

    :hover {
      color: ${(props) => props.theme.colors.primary};
    }
  `,
};
