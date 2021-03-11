import { Alert, Input, InputProps, Typography } from "antd";
import { FaEthereum } from "react-icons/fa";
import { provider as globalProvider } from "features";
import { providers, utils } from "ethers";
import Identicon from "react-identicons";
import React, { ChangeEvent, ReactNode, useCallback, useState } from "react";
import debounce from "lodash.debounce";
import noop from "lodash.noop";

const CHANGE_DEBOUNCE_RATE = 250;
const ENS_ADDRESS_SUFFIXES: Record<string, true> = {
  eth: true,
  xyz: true,
  luxe: true,
  kred: true,
  art: true,
  club: true,
};

interface Props extends Partial<InputProps> {
  provider?: null | providers.JsonRpcProvider;
  onAddressChange?(address: string): void;
  onError?(): void;
}

export default function EthereumAddressInput({
  provider = globalProvider,
  onChange = noop,
  onAddressChange = noop,
  onError = noop,
  ...rest
}: Props) {
  const [isValid, setIsValid] = useState(false);
  const [ensInfo, setEnsInfo] = useState<ReactNode>(null);
  const [errorInfo, setErrorInfo] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [identicon, setIdenticon] = useState("");
  // eslint-disable-next-line
  const handleChange = useCallback(
    debounce(async (event: ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value },
      } = event;
      const valueIsPotentialEns = value.includes(".");

      if (isTouched && value.length === 0) {
        setIsTouched(false);
      } else {
        setIsTouched(true);
      }

      if (valueIsPotentialEns) {
        if (provider) {
          const segments = value.split(".");
          const suffix = segments[segments.length - 1];

          if (ENS_ADDRESS_SUFFIXES[suffix]) {
            const address = await provider.resolveName(value);

            if (address) {
              setEnsInfo(
                <>
                  ENS address resolved to <br />
                  <Typography.Text code={true}>{address}</Typography.Text>
                </>
              );
              setIsValid(true);
              onAddressChange(address || value);
              setIdenticon(address);
            } else {
              setErrorInfo("This does not seem to be a valid ENS address.");
              setIsValid(false);
            }
          } else {
            setErrorInfo("This does not have a valid ENS address suffix.");
            setIsValid(false);
          }
        } else {
          setErrorInfo(
            "This looks like an ENS address, but you are not connected to your wallet, so we are unable to look it up."
          );
          setIsValid(false);
        }
      } else {
        if (value.length > 0) {
          try {
            utils.getAddress(value);

            if (provider) {
              // Are there any ENS names associated with this address?
              const address = await provider.lookupAddress(value);

              if (address) {
                setEnsInfo(
                  <>
                    Did you know? <br />
                    This ethereum address is associated with the ENS domain{" "}
                    <Typography.Text code={true}>{address}</Typography.Text>
                  </>
                );
              }

              setIsValid(true);
              onAddressChange(value);
              setIdenticon(address);
            }
          } catch {
            setErrorInfo("This is not a valid ethereum address.");
            setEnsInfo("");
            setIsValid(false);
            onAddressChange(value);
            setIdenticon("");
            onError();
          } finally {
            onChange(event);
          }
        } else {
          setErrorInfo("");
          setEnsInfo("");
          setIsValid(false);
          onAddressChange(value);
          setIdenticon("");
        }
      }
    }, CHANGE_DEBOUNCE_RATE),
    [provider, onChange, onError, isTouched]
  );

  return (
    <div>
      <Input
        autoFocus={true}
        spellCheck={false}
        onChange={handleChange}
        type="text"
        size="large"
        addonBefore={<FaEthereum />}
        addonAfter={isValid ? <Identicon string={identicon} /> : null}
        {...rest}
      />
      {!isValid && errorInfo && (
        <Alert
          message="This is not a valid ethereum address."
          type="error"
          showIcon
        />
      )}
      {isValid && ensInfo && <Alert message={ensInfo} type="info" showIcon />}
    </div>
  );
}
