import { Avatar, Space } from "antd";
import { PLACEHOLDER_TOKEN_IMAGE } from "config";

interface Props {
  address?: string;
  asAvatar?: boolean;
  name: string;
  image: string;
  size?: "tiny" | "small" | "medium" | "large";
  margin?: number;
  style?: any;
  symbol?: string;
  amount?: string;
}

export function Token({
  address = "",
  name,
  size = "small",
  image,
  margin = 0,
  asAvatar = false,
  symbol = "",
  amount = "",
  ...rest
}: Props) {
  let tokenImage = PLACEHOLDER_TOKEN_IMAGE;
  const tokenImageSize = {
    tiny: 16,
    small: 32,
    medium: 48,
    large: 64,
  }[size];
  const fontSize = size === "tiny" || size === "small" ? 16 : 24;

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

  const Component = asAvatar ? Avatar : "img";

  return (
    <Space size="small" style={rest.style}>
      {amount && (
        <Space size="small" style={{ fontSize }}>
          {amount}
        </Space>
      )}
      <Component
        alt={name}
        src={tokenImage}
        {...rest}
        style={{
          width: tokenImageSize,
          height: tokenImageSize,
          marginRight: margin,
        }}
      />
      {symbol && (
        <Space size="small" style={{ fontSize }}>
          {symbol}
        </Space>
      )}
    </Space>
  );
}
