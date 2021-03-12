import { Button, Collapse, CollapseProps } from "antd";
import { ReactNode, createContext, useEffect, useState } from "react";
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
  padding?: null | number | string;
  margin?: null | number | string;
}

const { Panel } = Collapse;

export default function Subscreen({
  title = "",
  children,
  defaultActions = null,
  padding = null,
  ...rest
}: SubscreenProps) {
  const [actions, setActions] = useState(defaultActions);

  useEffect(() => {
    setActions(defaultActions);
  }, [defaultActions]);

  return (
    <SubscreenContext.Provider value={{ setActions }}>
      <Collapse defaultActiveKey={["1"]} {...rest}>
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
        >
          {children}
          {actions && (
            <>
              {actions.map(({ type, title, onClick }, index) => (
                <Button type={type} key={index} onClick={onClick}>
                  {title}
                </Button>
              ))}
            </>
          )}
        </Panel>
      </Collapse>
    </SubscreenContext.Provider>
  );
}
