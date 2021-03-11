import { PLACEHOLDER_TOKEN_IMAGE } from "config";
import React from "react";

interface Props {
  address?: string;
  name: string;
  image: string;
  size?: "small" | "medium" | "large";
}

export default function Token({
  address = "",
  name,
  size = "medium",
  image,
  ...rest
}: Props) {
  let tokenImage = PLACEHOLDER_TOKEN_IMAGE;

  try {
    // First, do we have it locally?
    tokenImage = require(`assets/images/${image.toLowerCase()}.png`).default;
  } catch {
    if (address) {
      try {
        // Next, do they have it on 1inch?
        tokenImage = `https://tokens.1inch.exchange/${address.toLowerCase()}.png`;
      } catch {}
    }
  }

  return <img className="Token" alt={name} src={tokenImage} {...rest} />;
}
