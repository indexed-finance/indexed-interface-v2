import { Button } from "components/atoms";
import { MdAccountBalanceWallet } from "react-icons/md";
import { actions } from "features";
import { useDispatch } from "react-redux";
import React from "react";
import styled from "styled-components";

export default function WalletConnectorButton() {
  const dispatch = useDispatch();

  return (
    <S.Wallet
      type="ghost"
      icon={<MdAccountBalanceWallet />}
      onClick={() => dispatch(actions.attachToProvider())}
    />
  );
}

const S = {
  Wallet: styled(({ small, ...rest }) => <Button {...rest} />)<{
    small: boolean;
  }>`
    ${(props) => props.theme.snippets.perfectlyCentered};
  `,
};
