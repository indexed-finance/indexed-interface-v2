import { Avatar, Space } from "antd";
import { PLACEHOLDER_TOKEN_IMAGE } from "config";
import { ReactNode } from "react";

interface Props {
  symbol: string;
  asAvatar?: boolean;
  address?: string;
  name: string;
  size?: "tiny" | "small" | "medium" | "large";
  style?: any;
  amount?: string;
  isPair?: boolean;
  onlyImage?: boolean;
  symbolOverride?: string;
}

export function Token({
  asAvatar = false,
  address = "",
  name,
  size = "small",
  symbol,
  amount = "",
  onlyImage = false,
  symbolOverride = "",
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

  let image: string | ReactNode = "";

  if (symbol.startsWith("UNIV2:")) {
    const [, pair] = symbol.split("UNIV2:");
    const [firstSymbol, secondSymbol] = pair.split("-");

    image = (
      <div
        style={{
          width: tokenImageSize,
          height: tokenImageSize,
          position: "relative",
        }}
      >
        <img
          src={require(`images/${secondSymbol.toLowerCase()}.png`).default}
          alt={secondSymbol}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: tokenImageSize * 0.66,
            height: tokenImageSize * 0.66,
          }}
        />
        <img
          src={require(`images/${firstSymbol.toLowerCase()}.png`).default}
          alt={firstSymbol}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: tokenImageSize * 0.5,
            height: tokenImageSize * 0.5,
          }}
        />
      </div>
    );
  } else {
    try {
      image = require(`images/${symbol.toLowerCase()}.png`).default;
    } catch {
      if (address) {
        image = `https://tokens.dharma.io/assets/${address.toLowerCase()}/icon.png`;
      } else {
        image = PLACEHOLDER_TOKEN_IMAGE;
      }
    }
  }

  return (
    <Space size="small" style={rest.style}>
      {amount && (
        <Space size="small" style={{ fontSize }}>
          {amount}
        </Space>
      )}
      {image && (
        <>
          {typeof image === "string" ? (
            <Component
              alt={symbol}
              src={image}
              {...rest}
              style={{
                width: tokenImageSize,
                height: tokenImageSize,
              }}
            />
          ) : (
            image
          )}
        </>
      )}

      {symbol && !asAvatar && !onlyImage && (
        <Space size="small" style={{ fontSize }}>
          {symbolOverride || symbol}
        </Space>
      )}
    </Space>
  );
}
