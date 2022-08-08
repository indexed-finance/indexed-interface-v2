import { BiLinkExternal } from "react-icons/bi";
import { ReactNode } from "react";

export function ExternalLink({
  to,
  children,
  withIcon = true,
  style = {},
  ...rest
}: {
  to: string;
  children: ReactNode;
  style?: any;
  withIcon?: boolean;
}) {
  return (
    <a
      href={to}
      rel="noopener noreferrer"
      target="_blank"
      {...rest}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...style,
      }}
    >
      <div>{children}</div>{" "}
      {withIcon && <BiLinkExternal style={{ marginLeft: 4 }} />}
    </a>
  );
}
