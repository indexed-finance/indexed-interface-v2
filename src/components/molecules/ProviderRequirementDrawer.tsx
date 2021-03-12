import { Drawer, DrawerProps, Result } from "antd";
import { actions, selectors, useProvider } from "features";
import { useDispatch, useSelector } from "react-redux";

interface Props {
  includeSignerRequirement?: boolean;
  placement?: DrawerProps["placement"];
}

export function useProviderRequirement(includeSignerRequirement = false) {
  const [provider, signer] = useProvider();
  const address = useSelector(selectors.selectUserAddress);

  if (address) {
    return true;
  } else if (includeSignerRequirement) {
    return Boolean(provider && signer);
  } else {
    return Boolean(provider);
  }
}

export default function ProviderRequirementDrawer({
  includeSignerRequirement = false,
  placement = "bottom",
}: Props) {
  const dispatch = useDispatch();
  const meetsRequirement = useProviderRequirement(includeSignerRequirement);
  const title = includeSignerRequirement
    ? "Signer Required"
    : "Provider Required";
  const subTitle = `This functionality requires a ${
    includeSignerRequirement ? "signer" : "provider"
  }.`;

  const content = includeSignerRequirement
    ? "Click here to connect to your wallet."
    : "Enable server connection or click here to connect to your wallet.";

  const placementProps: any = {
    bottom: {
      height: "55%",
    },
    right: {
      width: "30%",
    },
  };

  return (
    <div onClick={() => dispatch(actions.attachToProvider())}>
      <Drawer
        className="requirement-drawer"
        placement={placement}
        closable={false}
        visible={!meetsRequirement}
        getContainer={false}
        {...placementProps[placement]}
      >
        <Result
          status="warning"
          title={title}
          subTitle={
            <>
              {subTitle} <br />
              {content}
            </>
          }
        ></Result>
      </Drawer>
    </div>
  );
}
