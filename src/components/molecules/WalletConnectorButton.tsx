import { Button } from "components/atoms";
import { MdAccountBalanceWallet } from "react-icons/md";
import { actions } from "features";
import { useDispatch } from "react-redux";
import React from "react";
import styled, { css } from "styled-components";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";

export default function WalletConnectorButton() {
  const dispatch = useDispatch();
  const breakpoints = useBreakpoint();

  return (
    <S.Wallet
      type="ghost"
      icon={<MdAccountBalanceWallet />}
      onClick={() => dispatch(actions.attachToProvider())}
      small={!breakpoints.md}
    />
  );
}

const S = {
  Wallet: styled(({ small, ...rest }) => <Button {...rest} />)<{
    small: boolean;
  }>`
    ${(props) => props.theme.snippets.perfectlyCentered};

    font-size: ${(props) => props.theme.fontSizes.huge};
    ${(props) =>
      props.small &&
      css`
        position: relative;
        top: -6px;
      `}
  `,
};
