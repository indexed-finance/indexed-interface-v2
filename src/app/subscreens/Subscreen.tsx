import { Collapse, CollapseProps } from "antd";
import React, { ReactNode } from "react";
import styled, { css } from "styled-components";

interface SubscreenProps extends CollapseProps {
  icon: ReactNode;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode[];
  padding?: null | number | string;
  margin?: null | number | string;
}

const { Panel } = Collapse;

export default function Subscreen({
  icon,
  title,
  children,
  actions = [],
  padding = null,
  ...rest
}: SubscreenProps) {
  return (
    <S.Subscreen defaultActiveKey={["1"]} {...rest} padding={padding}>
      <Panel
        header={
          <S.Title>
            <span>{title}</span> {icon}
          </S.Title>
        }
        key="1"
      >
        {children}
      </Panel>
    </S.Subscreen>
  );
}

const S = {
  Subscreen: styled(Collapse)<{ padding: null | number | string }>`
    margin-bottom: ${(props) => props.theme.spacing.medium};
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
};
