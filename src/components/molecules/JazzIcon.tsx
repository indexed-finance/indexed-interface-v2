import { Dropdown, Menu, notification } from "antd";
import { actions } from "features";
import { useBreakpoints } from "helpers";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "i18n";
import ReactDOM from "react-dom";
import jazzicon from "@metamask/jazzicon";

interface Props {
  address: string;
}

export default function JazzIcon({ address }: Props) {
  const translate = useTranslation();
  const dispatch = useDispatch();
  const blockie = useRef<null | HTMLSpanElement>(null);
  const handleDisconnect = useCallback(() => {
    dispatch(actions.userDisconnected());

    notification.info({
      message: translate("DISCONNECTED"),
      description: translate("YOU_HAVE_SUCCESSFULLY_DISCONNECTED_YOUR_WALLET"),
    });
  }, [dispatch, translate]);
  const breakpoints = useBreakpoints();

  // Effect:
  // On load, display a success notification.
  useEffect(() => {
    notification.success({
      message: translate("CONNECTED"),
      description: translate("YOU_HAVE_SUCCESSFULLY_CONNECTED_YOUR_WALLET"),
    });
  }, [translate]);

  // Effect:
  // Use refs to integrate the third party library for displaying a wallet identicon.
  useEffect(() => {
    const _blockie = blockie.current;
    let element: any;

    if (_blockie) {
      const parsedAddress = parseInt(address.slice(2, 10), 16);

      element = jazzicon(40, parsedAddress);
      element.style.border = "2px solid #ccccff";

      element.style.position = "relative";
      element.style.top = breakpoints.isMobile ? "4px" : "12px";

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
              {translate("VIEW_ON_ETHERSCAN")}
            </a>
          </Menu.Item>
          <Menu.Item onClick={handleDisconnect}>
            {translate("DISCONNECT")}
          </Menu.Item>
        </Menu>
      }
    >
      <span ref={blockie} />
    </Dropdown>
  );
}
