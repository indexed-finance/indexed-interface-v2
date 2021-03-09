import { Space, SpaceProps } from "antd";
import React, { ReactNode } from "react";
import styled from "styled-components";

export interface Props extends SpaceProps {
  children: ReactNode;
}

export default function Area(props: Props) {
  return <S.Area {...props} />;
}

const S = {
  Area: styled(Space)`
    padding: ${(props) => props.theme.spacing.medium};
    border-left: 2px solid ${(props) => props.theme.colors.purple100};
    display: block;
    background: ${(props) => props.theme.colors.black400};

    a {
      display: block;

      text-align: right;
    }
  `,
};
