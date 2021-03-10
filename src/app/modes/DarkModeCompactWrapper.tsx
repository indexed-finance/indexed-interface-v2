import "theme/modes/dark-mode-compact.less";
import React, { ReactNode } from "react";

export default function DarkModeCompactWrapper(props: { children: ReactNode }) {
  return <div {...props} />;
}
