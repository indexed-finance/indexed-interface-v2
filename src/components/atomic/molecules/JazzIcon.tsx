import { Dropdown, Menu, notification } from "antd";
import { ExternalLink } from "components/atomic/atoms";
import { actions } from "features";
import { explorerAddressLink } from "helpers";
import { useBreakpoints, useTranslator } from "hooks";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import ReactDOM from "react-dom";
import jazzicon from "@metamask/jazzicon";

interface Props {
  address: string;
  isWalletIcon?: boolean;
}

export function JazzIcon({ address, isWalletIcon = false }: Props) {
  const tx = useTranslator();
  const { deactivate } = useWeb3React();
  const dispatch = useDispatch();
  const blockie = useRef<null | HTMLSpanElement>(null);
  const handleDisconnect = useCallback(() => {
    deactivate();
    dispatch(actions.userDisconnected());

    notification.info({
      message: tx("DISCONNECTED"),
      description: tx("YOU_HAVE_SUCCESSFULLY_DISCONNECTED_YOUR_WALLET"),
    });
  }, [dispatch, deactivate, tx]);
  const breakpoints = useBreakpoints();
  const inner = <span ref={blockie} />;

  // Effect:
  // Use refs to integrate the third party library for displaying a wallet identicon.
  useEffect(() => {
    const _blockie = blockie.current;
    let element: any;

    if (_blockie) {
      const parsedAddress = parseInt(address.slice(2, 10), 16);

      element = jazzicon(28, parsedAddress);
      element.style.display = "block";
      element.style.border = "2px solid #ccccff";
      element.style.top = "-4px";

      _blockie.appendChild(element);
    }

    return () => {
      if (element) {
        element.remove();
      }

      if (_blockie) {
        ReactDOM.unmountComponentAtNode(_blockie);
      }
    };
  }, [address, breakpoints]);

  return isWalletIcon ? (
    <Dropdown
      arrow={true}
      placement={breakpoints.isMobile ? "topRight" : "bottomLeft"}
      overlay={
        <Menu>
          <Menu.Item>
            <ExternalLink to={explorerAddressLink(address)}>
              {tx("VIEW_ON_ETHERSCAN")}
            </ExternalLink>
          </Menu.Item>
          {isWalletIcon && (
            <Menu.Item onClick={handleDisconnect}>{tx("DISCONNECT")}</Menu.Item>
          )}
        </Menu>
      }
    >
      {inner}
    </Dropdown>
  ) : (
    <ExternalLink to={explorerAddressLink(address)} withIcon={false}>
      {inner}
    </ExternalLink>
  );
}
