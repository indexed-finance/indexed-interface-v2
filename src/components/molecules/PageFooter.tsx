import { Layout as AntLayout } from "antd";
import { BasicProps } from "antd/lib/layout/layout";
import React, { ReactNode } from "react";
import styled from "styled-components";

export interface Props extends Omit<BasicProps, "children"> {
  left: ReactNode;
  right: ReactNode;
}

export default function PageFooter(props: Props) {
  const { left, right } = props;

  return (
    <S.Footer {...props}>
      <div>{left}</div>
      <div>{right}</div>
    </S.Footer>
  );
}

const S = {
  Footer: styled(AntLayout.Footer)`
    ${(props) => props.theme.snippets.spacedBetween};
  `,
};
