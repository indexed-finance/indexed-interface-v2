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
    <a href={to} rel="noopener noreferrer" target="_blank" {...rest}>
      {children}
    </a>
  );
}
