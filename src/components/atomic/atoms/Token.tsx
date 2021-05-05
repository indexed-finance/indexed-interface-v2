import { Avatar, Space } from "antd";
import { PLACEHOLDER_TOKEN_IMAGE } from "config";

interface Props {
  asAvatar?: boolean;
  address?: string;
  name: string;
  size?: "tiny" | "small" | "medium" | "large";
  style?: any;
  symbol?: string;
  amount?: string;
}

export function Token({
  asAvatar = false,
  address = "",
  name,
  size = "small",
  symbol = "",
  amount = "",
  ...rest
}: Props) {
  const tokenImage = PLACEHOLDER_TOKEN_IMAGE;
  const tokenImageSize = {
    tiny: 16,
    small: 20,
    medium: 28,
    large: 36,
  }[size];
  const fontSize = size === "tiny" || size === "small" ? 16 : 24;
  const Component = asAvatar ? Avatar : "img";

  return (
    <Space size="small" style={rest.style}>
      {amount && (
        <Space size="small" style={{ fontSize }}>
          {amount}
        </Space>
      )}
      <Component
        alt={symbol}
        src={tokenImage}
        {...rest}
        style={{
          width: tokenImageSize,
          height: tokenImageSize,
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
