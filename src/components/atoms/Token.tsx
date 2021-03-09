import { PLACEHOLDER_TOKEN_IMAGE } from "config";
import React from "react";
import styled from "styled-components";

interface Props {
  name: string;
  image: string;
  size?: "small" | "medium" | "large";
}

export default function Token({
  name,
  size = "medium",
  image,
  ...rest
}: Props) {
  let tokenImage = PLACEHOLDER_TOKEN_IMAGE;

  try {
    tokenImage = require(`assets/images/${image.toLowerCase()}.png`).default;
  } catch {}

  return <S.Token alt={name} size={size} src={tokenImage} {...rest} />;
}

const S = {
  Token: styled.img<{ size: Props["size"] }>`
    ${(props) => props.theme.snippets.circular};

    ${(props) => props.size === "small" && props.theme.snippets.size16};
    ${(props) => props.size === "medium" && props.theme.snippets.size32};
    ${(props) => props.size === "large" && props.theme.snippets.size48};
  `,
};
