import "theme/styles.less";
import { Button } from "components";
import { Form, Grid, Layout, Popover, Select, Switch, Typography } from "antd";
import { ImConnection } from "react-icons/im";
import { Link } from "react-router-dom";
import { MdAccountBalanceWallet, MdSettings } from "react-icons/md";
import { actions, selectors } from "features";
import { useDispatch, useSelector } from "react-redux";
import React, { useMemo } from "react";
import styled from "styled-components";

const { useBreakpoint } = Grid;
const { Header } = Layout;
const { Item } = Form;
const { Option } = Select;

export default function AppHeader() {
  const dispatch = useDispatch();
  const language = useSelector(selectors.selectLanguageName);
  const theme = useSelector(selectors.selectTheme);
  const isConnected = useSelector(selectors.selectConnected);
  const isConnectionEnabled = useSelector(selectors.selectConnectionEnabled);
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
  const breakpoint = useBreakpoint();

  return (
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
                checkedChildren="🌙 Dark"
                unCheckedChildren="🔆 Light"
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
                      onClick={() => dispatch(actions.connectionToggled())}
                    />
                  </Typography.Text>
                </S.Connection>
              </Popover>
            </Item>
          </S.Changeables>
        </S.Controls>
      )}
    </S.Top>
  );
}

const S = {
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
};
