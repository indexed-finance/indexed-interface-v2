import { Form, Popconfirm, Typography } from "antd";
import { ImConnection } from "react-icons/im";
import { actions, selectors } from "features";
import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";
import { useTranslation } from "i18n";

interface Props {
  showText?: boolean;
}

const { Item } = Form;

export default function ServerConnection({ showText = false }: Props) {
  const tx = useTranslation();
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
