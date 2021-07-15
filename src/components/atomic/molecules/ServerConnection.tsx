import { ImConnection } from "react-icons/im";
import { MdAccountBalanceWallet } from "react-icons/md";
import { Space, Typography } from "antd";
import { abbreviateAddress } from "helpers";
import { selectors } from "features";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslator } from "hooks";

interface Props {
  showText?: boolean;
}

export function ServerConnection({ showText = false }: Props) {
  const tx = useTranslator();
  const userAddress = useSelector(selectors.selectUserAddress);
  const isUserConnected = useSelector(selectors.selectUserConnected);
  const isServerConnected = useSelector(selectors.selectConnected);
  const onBadNetwork = useSelector(selectors.selectBadNetwork);
  const connectionStatus = useMemo(() => {
    const firstPass = {
      type: (isUserConnected || isServerConnected
        ? "success"
        : "danger") as any,
      top: isServerConnected
        ? tx("CONNECTED_TO_SERVER")
        : tx("NOT_CONNECTED_TO_SERVER"),
      bottom: tx("DISABLE_SERVER_CONNECTION"),
      text: isServerConnected ? tx("CONNECTED") : tx("NOT_CONNECTED"),
    };

    if (onBadNetwork) {
      firstPass.type = "danger";
    }

    return firstPass;
  }, [tx, isUserConnected, isServerConnected, onBadNetwork]);
  const ConnectionIcon = isUserConnected
    ? MdAccountBalanceWallet
    : ImConnection;
  const connectionText =
    isUserConnected && userAddress ? (
      <div style={{ textTransform: "lowercase" }}>
        {abbreviateAddress(userAddress)}
      </div>
    ) : (
      connectionStatus.text
    );
  if (!isUserConnected) return <></>;
  return (
    <Typography.Title
      level={5}
      type={connectionStatus.type}
      style={{ textTransform: "uppercase", marginBottom: 0 }}
    >
      <Space>
        <ConnectionIcon style={{ position: "relative", top: 2 }} />
        {showText && connectionText}
      </Space>
    </Typography.Title>
  );
}
