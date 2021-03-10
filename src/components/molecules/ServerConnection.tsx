import { Form, Popconfirm, Typography } from "antd";
import { ImConnection } from "react-icons/im";
import { actions, selectors } from "features";
import { useDispatch, useSelector } from "react-redux";
import React, { useMemo } from "react";
import styled from "styled-components";

interface Props {
  showText?: boolean;
}

const { Item } = Form;

export default function ServerConnection({ showText = false }: Props) {
  const dispatch = useDispatch();
  const isConnected = useSelector(selectors.selectConnected);
  const isConnectionEnabled = useSelector(selectors.selectConnectionEnabled);
  const connectionStatus = useMemo(() => {
    if (isConnectionEnabled) {
      return {
        type: (isConnected ? "success" : "danger") as any,
        top: isConnected ? "Connected to server." : "Not connected to server.",
        bottom: "Disable server connection?",
        text: isConnected ? "Connected" : "Not connected",
      };
    } else {
      return {
        type: "secondary" as any,
        top: "Connection disabled.",
        bottom: "Enable server connection?",
        text: "Disabled",
      };
    }
  }, [isConnectionEnabled, isConnected]);

  return (
    <S.SelfCentered>
      <Popconfirm
        icon={null}
        placement="topLeft"
        title={
          <S.PerfectlyCentered>
            <S.ConnectionStatus />
            <div>
              <strong>{connectionStatus.top}</strong>
              <br />
              <em>{connectionStatus.bottom}</em>
            </div>
          </S.PerfectlyCentered>
        }
        onConfirm={() => dispatch(actions.connectionToggled())}
        okText="Yes"
        cancelText="No"
      >
        <S.Connection>
          <S.Status type={connectionStatus.type}>
            <S.ConnectionStatus />
            {showText && <S.Text>{connectionStatus.text}</S.Text>}
          </S.Status>
        </S.Connection>
      </Popconfirm>
    </S.SelfCentered>
  );
}

const S = {
  Connection: styled.div`
    ${(props) => props.theme.snippets.perfectlyCentered};
    margin: 0;
  `,
  ConnectionStatus: styled(ImConnection)`
    font-size: ${(props) => props.theme.fontSizes.huge};
    cursor: pointer;
    transition: color 0.6s;

    :hover {
      color: ${(props) => props.theme.colors.primary};
    }
  `,
  PerfectlyCentered: styled.div`
    ${(props) => props.theme.snippets.perfectlyCentered};

    svg {
      margin-right: ${(props) => props.theme.spacing.medium};
    }
  `,
  SelfCentered: styled(Item)`
    align-self: center;
    margin-bottom: 0;
  `,
  Status: styled(Typography.Text)`
    ${(props) => props.theme.snippets.perfectlyCentered};
  `,
  Text: styled.span`
    margin-left: ${(props) => props.theme.spacing.small};
    ${(props) => props.theme.snippets.fancy};
    font-size: ${(props) => props.theme.fontSizes.tiny};
  `,
};
