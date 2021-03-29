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
  const translate = useTranslation();
  const dispatch = useDispatch();
  const isConnected = useSelector(selectors.selectConnected);
  const isConnectionEnabled = useSelector(selectors.selectConnectionEnabled);
  const connectionStatus = useMemo(() => {
    if (isConnectionEnabled) {
      return {
        type: (isConnected ? "success" : "danger") as any,
        top: isConnected
          ? translate("CONNECTED_TO_SERVER")
          : translate("NOT_CONNECTED_TO_SERVER"),
        bottom: translate("DISABLE_SERVER_CONNECTION"),
        text: isConnected ? translate("CONNECTED") : translate("NOT_CONNECTED"),
      };
    } else {
      return {
        type: "secondary" as any,
        top: translate("CONNECTION_DISABLED"),
        bottom: translate("ENABLE_SERVER_CONNECTION"),
        text: translate("DISABLED"),
      };
    }
  }, [isConnectionEnabled, isConnected, translate]);

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
