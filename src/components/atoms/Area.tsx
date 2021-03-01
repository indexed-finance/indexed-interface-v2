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
    border-left: 2px solid ${(props) => props.theme.colors.primary};
    display: block;
    background: ${(props) => props.theme.colors.lightestGrey};

    a {
      display: block;

      text-align: right;
    }
  `,
};
