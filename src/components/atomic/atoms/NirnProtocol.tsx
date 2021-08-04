import { ReactNode } from "react";
import { Space } from "antd";

interface Props {
  name: string;
  size?: "tiny" | "small" | "medium" | "large";
  style?: any;
  showName?: boolean;
}

const nameLookup: Record<string, string> = {
  'compound': 'comp',
  'aavev1': 'aave',
  'aavev2': 'aave'
}

export function NirnProtocol({
  showName = false,
  name,
  size = "small",
  style,
  ...rest
}: Props) {
  const tokenImageSize = {
    tiny: 16,
    small: 20,
    medium: 28,
    large: 36,
  }[size];
  const fontSize = size === "tiny" || size === "small" ? 16 : 24;

  let image: string | ReactNode = "";

  let formattedName = name.toLowerCase().replace(/ /g, '');
  if (nameLookup[formattedName]) {
    formattedName = nameLookup[formattedName]
  }

  try { image = require(`images/${formattedName.toLowerCase()}.png`).default; }
  catch { image = "" }

  return (
    <Space size="small" style={style}>
      {image && (
        <>
          {typeof image === "string" ? (
            <img
              alt={name}
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

      {showName && (
        <Space size="small" style={{ fontSize }}>
          {name}
        </Space>
      )}
    </Space>
  );
}
