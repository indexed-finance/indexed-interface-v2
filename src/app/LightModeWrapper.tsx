import "theme/modes/light-mode.less";
import React, { ReactNode } from "react";

export default function LightModeWrapper(props: { children: ReactNode }) {
  return <div {...props} />;
}
