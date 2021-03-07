import "theme/modes/dark-mode.less";
import React, { ReactNode } from "react";

export default function DarkModeWrapper(props: { children: ReactNode }) {
  return <div {...props} />;
}
