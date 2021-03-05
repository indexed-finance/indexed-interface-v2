import { Button, Collapse, CollapseProps } from "antd";
import React, { ReactNode, createContext, useState } from "react";
import noop from "lodash.noop";
import styled, { css } from "styled-components";

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
  icon: ReactNode;
  title?: ReactNode;
  children: ReactNode;
  defaultActions?: null | Action[];
  padding?: null | number | string;
  margin?: null | number | string;
}

const { Panel } = Collapse;

export default function Subscreen({
  icon,
  title = "",
  children,
  defaultActions = null,
  padding = null,
  ...rest
}: SubscreenProps) {
  const [actions, setActions] = useState(defaultActions);

  React.useEffect(() => {
    setActions(defaultActions);
  }, [defaultActions]);

  return (
    <SubscreenContext.Provider value={{ setActions }}>
      <S.Subscreen
        defaultActiveKey={["1"]}
        {...rest}
        padding={padding}
        withActions={actions ? actions.length : 0}
      >
        <Panel
          header={
            title ? (
              <S.Title>
                <span>{title}</span> {icon}
              </S.Title>
            ) : (
              <S.Hidden>_</S.Hidden>
            )
          }
          key="1"
        >
          {children}
          {actions && (
            <S.Actions>
              {actions.map(({ type, title, onClick }, index) => (
                <Button type={type} key={index} onClick={onClick}>
                  {title}
                </Button>
              ))}
            </S.Actions>
          )}
        </Panel>
      </S.Subscreen>
    </SubscreenContext.Provider>
  );
}

const S = {
  Subscreen: styled(Collapse)<{
    padding: null | number | string;
    withActions?: number;
  }>`
    position: relative;
    margin-bottom: ${(props) => props.theme.spacing.medium};
    padding-bottom: ${(props) => props.withActions ?? 0 * 42}px;
    overflow: auto;

    ${(props) =>
      props.padding != null &&
      css`
        .ant-collapse-content-box {
          padding: ${props.padding};
        }
      `}

    .ant-space {
      display: flex;
    }
    .ant-space-item {
      flex: 1;
    }
  `,
  Title: styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    ${(props) => props.theme.snippets.fancy};

    span {
      margin-right: ${(props) => props.theme.spacing.small};
    }
  `,
  Actions: styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;

    button {
      height: 42px;
      margin-bottom: 1px;
      ${(props) => props.theme.snippets.fancy};
    }
  `,
  Hidden: styled.span`
    visibility: hidden;
  `,
};
