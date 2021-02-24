import { Space } from "antd";
import React, { ReactNode } from "react";
import styled from "styled-components";

export interface Props {
  children: ReactNode;
}

export default function Area(props: Props) {
  return <S.Area>{props.children}</S.Area>;
}

const S = {
  Area: styled(Space)`
    padding: ${(props) => props.theme.spacing.medium};
    margin-bottom: ${(props) => props.theme.spacing.large};
    border-left: 2px solid ${(props) => props.theme.colors.blue100};
    padding-left: ${(props) => props.theme.spacing.medium};
    display: block;
    background: ${(props) => props.theme.colors.white400};

    a {
      display: block;

      text-align: right;
    }
  `,
};
