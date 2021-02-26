import { Typography } from "antd";
import React from "react";
import styled from "styled-components";

export default function Logo() {
  return (
    <S.LogoWrapper>
      <S.Logo src={require("assets/images/indexed-dark.png").default}></S.Logo>
      <S.LogoText>
        <S.Title level={3}>Indexed</S.Title>
      </S.LogoText>
    </S.LogoWrapper>
  );
}

const S = {
  LogoWrapper: styled.a`
    ${(props) => props.theme.snippets.perfectlyAligned};
    ${(props) => props.theme.snippets.fancy};
    padding: ${(props) => props.theme.spacing.medium};
  `,
  LogoText: styled.div``,
  Logo: styled.img`
    ${(props) => props.theme.snippets.size30};
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
  Title: styled(Typography.Title)`
    margin: 0 !important;
    font-weight: 200 !important;
  `,
};
