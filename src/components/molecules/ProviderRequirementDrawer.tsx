import { Drawer, DrawerProps, Result } from "antd";
import { actions, useProvider } from "features";
import { useDispatch } from "react-redux";
import React from "react";
import styled from "styled-components";

interface Props {
  meetsRequirement: boolean;
  includeSignerRequirement?: boolean;
  placement?: DrawerProps["placement"];
}

export function useProviderRequirement(includeSignerRequirement = false) {
  const [provider, signer] = useProvider();

  if (includeSignerRequirement) {
    return Boolean(provider && signer);
  } else {
    return Boolean(provider);
  }
}

export default function ProviderRequirementDrawer({
  meetsRequirement,
  includeSignerRequirement = false,
  placement = "bottom",
}: Props) {
  const dispatch = useDispatch();
  const title = includeSignerRequirement
    ? "Signer Required"
    : "Provider Required";
  const subTitle = `This functionality requires a ${
    includeSignerRequirement ? "signer" : "provider"
  }.`;

  const content = includeSignerRequirement
    ? "Click here to connect to your wallet."
    : "Enable server connection or click here to connect to your wallet.";

  return (
    <div onClick={() => dispatch(actions.attachToProvider())}>
      <S.Drawer
        className="bottom-drawer"
        placement={placement}
        closable={false}
        visible={!meetsRequirement}
        getContainer={false}
        height="55%"
      >
        <S.Result
          status="warning"
          title={title}
          subTitle={
            <>
              {subTitle} <br />
              {content}
            </>
          }
        ></S.Result>
      </S.Drawer>
    </div>
  );
}

const S = {
  Drawer: styled(Drawer)`
    position: absolute;
  `,
  Result: styled(Result)`
    text-align: center;
  `,
};
