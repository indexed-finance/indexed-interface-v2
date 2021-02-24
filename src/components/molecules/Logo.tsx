import { Typography } from "antd";
import React from "react";
import styled from "styled-components";

export interface Props {
  tagline?: boolean;
}

export default function Logo({ tagline = true }: Props) {
  return (
    <S.LogoWrapper>
      <S.Logo src="images/indexed-dark.png"></S.Logo>
      <S.LogoText>
        <S.Title level={3}>Indexed</S.Title>
        {tagline && <S.Title level={4}>This is our tagline.</S.Title>}
      </S.LogoText>
    </S.LogoWrapper>
  );
}

const S = {
  LogoWrapper: styled.a`
    ${(props) => props.theme.snippets.perfectlyAligned};
    padding: ${(props) => props.theme.spacing.medium};
    justify-content: center;
  `,
  LogoText: styled.div``,
  Logo: styled.img`
    ${(props) => props.theme.snippets.size30};
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
  Title: styled(Typography.Title)`
    color: white !important;

    margin: 0 !important;
    font-weight: 200 !important;
  `,
};
