import { Avatar, Space } from "antd";

interface Props {
  symbol: string;
  asAvatar?: boolean;
  address?: string;
  name: string;
  size?: "tiny" | "small" | "medium" | "large";
  style?: any;
  amount?: string;
}

export function Token({
  asAvatar = false,
  address = "",
  name,
  size = "small",
  symbol,
  amount = "",
  ...rest
}: Props) {
  const tokenImageSize = {
    tiny: 16,
    small: 20,
    medium: 28,
    large: 36,
  }[size];
  const fontSize = size === "tiny" || size === "small" ? 16 : 24;
  const Component = asAvatar ? Avatar : "img";

  let image = "";

  try {
    image = require(`images/${symbol.toLowerCase()}.png`).default;
  } catch {
    if (address) image = `https://tokens.1inch.exchange/${address.toLowerCase()}.png`;
  }

  return (
    <Space size="small" style={rest.style}>
      {amount && (
        <Space size="small" style={{ fontSize }}>
          {amount}
        </Space>
      )}
      {image && (
        <Component
          alt={symbol}
          src={image}
          {...rest}
          style={{
            width: tokenImageSize,
            height: tokenImageSize,
          }}
        />
      )}

      {symbol && !asAvatar && (
        <Space size="small" style={{ fontSize }}>
          {symbol}
        </Space>
      )}
    </Space>
  );
}
