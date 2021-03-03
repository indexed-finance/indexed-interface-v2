import { MdSwapCalls } from "react-icons/md";
import Button from "./Button";
import React, { ReactNode } from "react";
import styled from "styled-components";

interface Props {
  left?: ReactNode;
  onFlip(): void;
  right?: ReactNode;
}

export default function Flipper({ left, onFlip, right }: Props) {
  return (
    <div style={{ position: "relative" }}>
      <S.Inner>
        {left}
        <S.Button type="primary" onClick={onFlip}>
          <S.Icon />
        </S.Button>
        {right}
      </S.Inner>
    </div>
  );
}

const S = {
  Button: styled(Button)`
    ${(props) => props.theme.snippets.perfectlyAligned};
  `,
  Icon: styled(MdSwapCalls)`
    font-size: ${(props) => props.theme.fontSizes.medium};
    margin-right: ${(props) => props.theme.spacing.small};
  `,
  Inner: styled.div`
    position: absolute;
    top: -32px;
    left: 25%;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    ${(props) => props.theme.snippets.fancy};

    > * {
      flex: 1;
    }

    svg {
      margin-right: 0;
      font-size: ${(props) => props.theme.fontSizes.huge};
    }
  `,
};
