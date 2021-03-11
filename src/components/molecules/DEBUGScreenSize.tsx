import { Typography } from "antd";
import { useBreakpoints } from "helpers";
import React from "react";
import styled from "styled-components";

export default function DEBUGScreenSize() {
  const {
    isMobile,
    xs = false,
    sm = false,
    md = false,
    lg = false,
    xl = false,
    xxl = false,
  } = useBreakpoints();
  const successOrDanger = (factor: boolean) => (factor ? "success" : "danger");

  return (
    <S.ScreenSize>
      <S.Paragraph type={successOrDanger(isMobile)}>Is mobile?</S.Paragraph>
      <S.Paragraph type={successOrDanger(xs)}>Extra Small</S.Paragraph>
      <S.Paragraph type={successOrDanger(sm)}>Small</S.Paragraph>
      <S.Paragraph type={successOrDanger(md)}>Medium</S.Paragraph>
      <S.Paragraph type={successOrDanger(lg)}>Large</S.Paragraph>
      <S.Paragraph type={successOrDanger(xl)}>Extra Large</S.Paragraph>
      <S.Paragraph type={successOrDanger(xxl)}>Huge</S.Paragraph>
    </S.ScreenSize>
  );
}

const S = {
  ScreenSize: styled.div`
    position: fixed;
    right: 0;
    bottom: 0;
    z-index: 4;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.75rem;
    border-top: 1px solid #ccccff;
    border-left: 1px solid #ccccff;
  `,
  Paragraph: styled(Typography.Paragraph)`
    margin-bottom: 0 !important;
    font-size: 12px !important;
  `,
};
