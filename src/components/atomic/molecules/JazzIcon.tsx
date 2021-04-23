import { Dropdown, Menu, notification } from "antd";
import { actions } from "features";
import { useBreakpoints, useTranslator } from "hooks";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import ReactDOM from "react-dom";
import jazzicon from "@metamask/jazzicon";

interface Props {
  address: string;
}

export function JazzIcon({ address }: Props) {
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

  return (
    <Dropdown
      arrow={true}
      placement={breakpoints.isMobile ? "topRight" : "bottomLeft"}
      overlay={
        <Menu>
          <Menu.Item>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://etherscan.io/address/${address}`}
            >
              {tx("VIEW_ON_ETHERSCAN")}
            </a>
          </Menu.Item>
          <Menu.Item onClick={handleDisconnect}>{tx("DISCONNECT")}</Menu.Item>
        </Menu>
      }
    >
      <span ref={blockie} />
    </Dropdown>
  );
}
