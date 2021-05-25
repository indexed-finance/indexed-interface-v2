import { BiLinkExternal } from "react-icons/bi";
import { ReactNode } from "react";

export function ExternalLink({
  to,
  children,
  ...rest
}: {
  to: string;
  children: ReactNode;
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
      <div>{children}</div> <BiLinkExternal />
    </a>
  );
}
