import { Divider } from "antd";
import { MdSwapCalls } from "react-icons/md";
import Button from "./Button";
import React from "react";
import styled from "styled-components";

interface Props {
  onFlip(): void;
}

export default function Flipper({ onFlip }: Props) {
  return (
    <Divider>
      <S.Button icon={<S.Icon />} type="dashed" onClick={onFlip}>
        Flip
      </S.Button>
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
};
