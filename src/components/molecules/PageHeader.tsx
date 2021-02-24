import {
  PageHeader as AntPageHeader,
  Dropdown,
  Menu,
  PageHeaderProps,
} from "antd";
import { BsMoon, BsSun } from "react-icons/bs";
import { Button } from "components/atoms";
import { CaretDownOutlined } from "@ant-design/icons";
import { actions, selectors } from "features";
import { useDispatch, useSelector } from "react-redux";
import React, { ReactNode } from "react";
import styled from "styled-components";

type LinkEntry = {
  text: ReactNode;
  route: string;
};

export type Props = PageHeaderProps & {
  links?: LinkEntry[];
};

export default function PageHeader({ links = [], ...rest }: Props) {
  const dispatch = useDispatch();
  const themeVariation = useSelector(selectors.selectTheme);
  const otherMode = themeVariation === "dark" ? "light" : "dark";

  return (
    <S.Header
      {...rest}
      extra={
        <>
          {rest.extra}
          {links.map((link: any) =>
            link.route.includes("categories") ? (
              <S.Dropdown
                key={link.route}
                overlay={
                  <Menu>
                    {[].map(
                      ({ name, symbol }: { name: string; symbol: string }) => (
                        <Menu.Item key={symbol}>
                          <S.Button type="link" href={`/categories/${symbol}`}>
                            {name}
                          </S.Button>
                        </Menu.Item>
                      )
                    )}
                  </Menu>
                }
              >
                <a href={link.route}>
                  {link.text} <CaretDownOutlined />
                </a>
              </S.Dropdown>
            ) : (
              <S.AntButton key={link.route} type="link" href={link.route}>
                {link.text}
              </S.AntButton>
            )
          )}
          <Button
            title={`Switch to ${otherMode} mode`}
            type="link"
            icon={themeVariation === "dark" ? <S.MoonIcon /> : <S.SunIcon />}
            onClick={() => dispatch(actions.themeToggled())}
          />
          <Button
            type="link"
            title="Connect to your wallet"
            onClick={() => dispatch(actions.initialize())}
          >
            Connect
          </Button>
        </>
      }
    />
  );
}

const S = {
  Dropdown: styled(Dropdown)``,
  Header: styled(AntPageHeader)`
    .ant-page-header-heading-title {
      color: ${(props) => props.theme.header.color};
      ${(props) => props.theme.snippets.fancy};
    }
  `,
  AntButton: styled(Button)`
    ${(props) => props.theme.snippets.fancy};
  `,
  Button: styled(Button)`
    display: block;
    text-align: left;
    ${(props) => props.theme.snippets.fancy};
  `,
  MoonIcon: styled(BsMoon)`
    color: #1890ff;
  `,
  SunIcon: styled(BsSun)`
    color: #1890ff;
  `,
};
