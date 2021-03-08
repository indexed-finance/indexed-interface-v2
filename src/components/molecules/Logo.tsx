import { Typography } from "antd";
import { selectors } from "features";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import React from "react";
import styled from "styled-components";

interface Props {
  withTitle?: boolean;
}

export default function Logo({ withTitle = true }: Props) {
  const history = useHistory();
  const theme = useSelector(selectors.selectTheme);

  return (
    <S.LogoWrapper onClick={() => history.push("/")}>
      <S.Logo src={require(`assets/images/indexed-${theme}.png`).default} />
      {withTitle && <S.Title level={3}>Indexed</S.Title>}
    </S.LogoWrapper>
  );
}

const S = {
  LogoWrapper: styled.div`
    ${(props) => props.theme.snippets.perfectlyAligned};
    ${(props) => props.theme.snippets.fancy};
    padding: ${(props) => props.theme.spacing.medium};
  `,
  Logo: styled.img`
    ${(props) => props.theme.snippets.size30};
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
  Title: styled(Typography.Title)`
    margin: 0 !important;
    font-weight: 200 !important;
  `,
};
