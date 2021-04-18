import { Collapse, CollapseProps } from "antd";
import { ReactNode, createContext } from "react";
import noop from "lodash.noop";

export type Action = {
  type: "primary" | "default";
  title: ReactNode;
  onClick(): void;
};

export const SubscreenContext = createContext<{
  setActions: (actions: Action[]) => void;
}>({
  setActions: noop,
});

interface SubscreenProps extends CollapseProps {
  title?: ReactNode;
  children: ReactNode;
  defaultActions?: null | Action[];
  showTitle?: boolean;
}

const { Panel } = Collapse;

export function Subscreen({
  title = "",
  children,
  defaultActions = null,
  showTitle = true,
  ...rest
}: SubscreenProps) {
  return (
    <Collapse
      defaultActiveKey={["1"]}
      {...rest}
      style={{ width: "100%", color: "white" }}
    >
      <Panel
        header={
          title ? (
            <>
              <span>{title}</span>
            </>
          ) : (
            <span>_</span>
          )
        }
        key="1"
        style={{ width: "100%" }}
      >
        {children}
      </Panel>
    </Collapse>
  );
}
