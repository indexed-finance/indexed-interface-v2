import { ImConnection } from "react-icons/im";
import { Popconfirm, Space, Typography } from "antd";
import { actions, selectors } from "features";
import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";
import { useTranslator } from "hooks";

interface Props {
  showText?: boolean;
}

export function ServerConnection({ showText = false }: Props) {
  const tx = useTranslator();
  const dispatch = useDispatch();
  const isConnected = useSelector(selectors.selectConnected);
  const isConnectionEnabled = useSelector(selectors.selectConnectionEnabled);
  const connectionStatus = useMemo(() => {
    if (isConnectionEnabled) {
      return {
        type: (isConnected ? "success" : "danger") as any,
        top: isConnected
          ? tx("CONNECTED_TO_SERVER")
          : tx("NOT_CONNECTED_TO_SERVER"),
        bottom: tx("DISABLE_SERVER_CONNECTION"),
        text: isConnected ? tx("CONNECTED") : tx("NOT_CONNECTED"),
      };
    } else {
      return {
        type: "secondary" as any,
        top: tx("CONNECTION_DISABLED"),
        bottom: tx("ENABLE_SERVER_CONNECTION"),
        text: tx("DISABLED"),
      };
    }
  }, [isConnectionEnabled, isConnected, tx]);

  return (
    <Popconfirm
      icon={null}
      placement="topLeft"
      title={
        <Space>
          <ImConnection />
          <div>
            <strong>{connectionStatus.top}</strong>
            <br />
            <em>{connectionStatus.bottom}</em>
          </div>
        </Space>
      }
      onConfirm={() => dispatch(actions.connectionToggled())}
      okText="Yes"
      cancelText="No"
    >
      <Typography.Title
        level={5}
        type={connectionStatus.type}
        style={{ textTransform: "uppercase", marginBottom: 0 }}
      >
        <Space>
          <ImConnection style={{ position: "relative", top: 2 }} />
          {showText && connectionStatus.text}
        </Space>
      </Typography.Title>
    </Popconfirm>
  );
}
