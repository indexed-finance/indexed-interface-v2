import { Button } from "antd";
import { MdAccountBalanceWallet } from "react-icons/md";
import { actions } from "features";
import { useDispatch } from "react-redux";
import React from "react";

export default function WalletConnectorButton() {
  const dispatch = useDispatch();

  return (
    <Button
      type="ghost"
      icon={<MdAccountBalanceWallet />}
      onClick={() => dispatch(actions.attachToProvider())}
    />
  );
}
