import { BiLinkExternal } from "react-icons/bi";
import { ReactNode } from "react";

export function ExternalLink({
  to,
  children,
  withIcon = true,
  ...rest
}: {
  to: string;
  children: ReactNode;
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
      }}
    >
      <div>{children}</div>{" "}
      {withIcon && <BiLinkExternal style={{ marginLeft: 4 }} />}
    </a>
  );
}
