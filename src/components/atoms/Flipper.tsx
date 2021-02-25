import { Divider } from "antd";
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
    <Divider>
      <S.Inner>
        {left}
        <S.Button icon={<S.Icon />} type="dashed" onClick={onFlip}>
          Flip
        </S.Button>
        {right}
      </S.Inner>
    </Divider>
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
    display: flex;
    align-items: center;
    justify-content: space-between;

    > * {
      flex: 1;
    }
  `,
};
