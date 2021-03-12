import { Form, Popconfirm, Typography } from "antd";
import { ImConnection } from "react-icons/im";
import { actions, selectors } from "features";
import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";

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
    <Item className="ServerConnection">
      <Popconfirm
        icon={null}
        placement="topLeft"
        title={
          <div>
            <ImConnection />
            <div>
              <strong>{connectionStatus.top}</strong>
              <br />
              <em>{connectionStatus.bottom}</em>
            </div>
          </div>
        }
        onConfirm={() => dispatch(actions.connectionToggled())}
        okText="Yes"
        cancelText="No"
      >
        <div>
          <Typography.Text type={connectionStatus.type}>
            <ImConnection />
            {showText && connectionStatus.text}
          </Typography.Text>
        </div>
      </Popconfirm>
    </Item>
  );
}
