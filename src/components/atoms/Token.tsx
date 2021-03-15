import { Avatar } from "antd";
import { PLACEHOLDER_TOKEN_IMAGE } from "config";

interface Props {
  address?: string;
  name: string;
  image: string;
  size?: "tiny" | "small" | "medium" | "large";
  margin?: number;
}

export default function Token({
  address = "",
  name,
  size = "small",
  image,
  margin = 0,
  ...rest
}: Props) {
  let tokenImage = PLACEHOLDER_TOKEN_IMAGE;
  const tokenImageSize = {
    tiny: 16,
    small: 32,
    medium: 48,
    large: 64,
  }[size];

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

  return (
    <Avatar
      className="Token"
      alt={name}
      src={tokenImage}
      {...rest}
      style={{
        width: tokenImageSize,
        height: tokenImageSize,
        marginRight: margin,
      }}
    />
  );
}
