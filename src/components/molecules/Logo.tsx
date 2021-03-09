import { Typography } from "antd";
import { selectors } from "features";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import React from "react";
import styled from "styled-components";

interface Props {
  link?: string;
  title?: string;
  withTitle?: boolean;
  size?: "small" | "large";
}

export default function Logo({
  link = "/",
  withTitle = true,
  title = "Indexed",
  size = "large",
}: Props) {
  const history = useHistory();
  const theme = useSelector(selectors.selectTheme);

  return (
    <S.LogoWrapper onClick={() => history.push(link)}>
      <S.Logo
        src={require(`assets/images/indexed-${theme}.png`).default}
        size={size}
      />
      {withTitle && <S.Title level={3}>{title}</S.Title>}
    </S.LogoWrapper>
  );
}

const S = {
  LogoWrapper: styled.div`
    ${(props) => props.theme.snippets.perfectlyAligned};
    ${(props) => props.theme.snippets.fancy};
    padding: ${(props) => props.theme.spacing.medium};
  `,
  Logo: styled.img<{ size: Props["size"] }>`
    ${(props) =>
      props.size === "small"
        ? props.theme.snippets.size14
        : props.theme.snippets.size28};
    margin-right: ${(props) => props.theme.spacing.small};
  `,
  Title: styled(Typography.Title)`
    margin: 0 !important;
    font-weight: 200 !important;
    transition: color 0.3s ease-in-out;

    :hover {
      color: #ccccff;
      cursor: pointer;
    }
  `,
};
