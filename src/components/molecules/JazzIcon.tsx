import { Dropdown, Menu } from "antd";
import { actions } from "features";
import { useDispatch } from "react-redux";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import jazzicon from "@metamask/jazzicon";
import styled from "styled-components";

interface Props {
  address: string;
}

export default function JazzIcon({ address }: Props) {
  const dispatch = useDispatch();
  const blockie = useRef<null | HTMLSpanElement>(null);

  useEffect(() => {
    const _blockie = blockie.current;

    if (_blockie) {
      const parsedAddress = parseInt(address.slice(2, 10), 16);
      const element = jazzicon(35, parsedAddress);

      element.style.border = "2px solid #ccccff";

      _blockie.appendChild(element);
    }

    return () => {
      if (_blockie) {
        ReactDOM.unmountComponentAtNode(_blockie);
      }
    };
  }, [address]);

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`https://etherscan.io/address/${address}`}
    >
      <Dropdown
        arrow={true}
        overlay={
          <Menu>
            <Menu.Item>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://etherscan.io/address/${address}`}
              >
                View on Etherscan
              </a>
            </Menu.Item>
            <Menu.Item onClick={() => dispatch(actions.userDisconnected())}>
              Disconnect
            </Menu.Item>
          </Menu>
        }
      >
        <S.Blockie ref={blockie} />
      </Dropdown>
    </a>
  );
}

const S = {
  JazzIcon: styled.div`
    /* position: relative; */
  `,
  Blockie: styled.span`
    /* position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%; */
  `,
};
