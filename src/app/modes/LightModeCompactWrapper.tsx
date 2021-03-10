import "theme/modes/light-mode-compact.less";
import React, { ReactNode } from "react";

export default function LightModeCompactWrapper(props: {
  children: ReactNode;
}) {
  return <div {...props} />;
}
