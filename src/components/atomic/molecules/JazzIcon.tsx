import { Dropdown, Menu, notification } from "antd";
import { ExternalLink } from "components/atomic/atoms";
import { actions } from "features";
import { useBreakpoints, useTranslator } from "hooks";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import Davatar from "@davatar/react";
interface Props {
  address: string;
  isWalletIcon?: boolean;
}

export function JazzIcon({ address, isWalletIcon = false }: Props) {
  const tx = useTranslator();
  const { deactivate } = useWeb3React();
  const dispatch = useDispatch();
  const handleDisconnect = useCallback(() => {
    deactivate();
    dispatch(actions.userDisconnected());

    notification.info({
      message: tx("DISCONNECTED"),
      description: tx("YOU_HAVE_SUCCESSFULLY_DISCONNECTED_YOUR_WALLET"),
    });
  }, [dispatch, deactivate, tx]);
  const breakpoints = useBreakpoints();

  const getDavatar = () => (
    <Davatar size={30} address={address} generatedAvatarType="jazzicon" />
  );
  return isWalletIcon ? (
    <Dropdown
      arrow={true}
      placement={breakpoints.isMobile ? "topRight" : "bottomLeft"}
      overlay={
        <Menu>
          <Menu.Item>
            <ExternalLink to={`https://etherscan.io/address/${address}`}>
              {tx("VIEW_ON_ETHERSCAN")}
            </ExternalLink>
          </Menu.Item>
          {isWalletIcon && (
            <Menu.Item onClick={handleDisconnect}>{tx("DISCONNECT")}</Menu.Item>
          )}
        </Menu>
      }
    >
      <span>{getDavatar()}</span>
    </Dropdown>
  ) : (
    <ExternalLink to={`https://etherscan.io/tx/${address}`} withIcon={false}>
      {getDavatar()}
    </ExternalLink>
  );
}
