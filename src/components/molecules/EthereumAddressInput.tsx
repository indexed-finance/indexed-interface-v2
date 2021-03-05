import { Alert, Input, InputProps, Typography } from "antd";
import { FaEthereum } from "react-icons/fa";
import { provider as globalProvider } from "features";
import { providers, utils } from "ethers";
import Identicon from "react-identicons";
import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import debounce from "lodash.debounce";
import noop from "lodash.noop";
import styled, { css } from "styled-components";

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
  const [ensAddress, setEnsAddress] = useState("");
  const [ensLookup, setEnsLookup] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const hasError = isTouched && !isValid;
  // eslint-disable-next-line
  const handleChange = useCallback(
    debounce(async (event: ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value },
      } = event;

      if (isTouched && value.length === 0) {
        setIsTouched(false);
        setEnsLookup("");
        setEnsAddress("");
      } else if (!isTouched) {
        setIsTouched(true);
      }

      try {
        // First, check for ENS address.
        const segments = value.split(".");
        const suffix = segments[segments.length - 1];

        if (ENS_ADDRESS_SUFFIXES[suffix] && provider) {
          setIsValid(true);

          const address = await provider.resolveName(value);

          if (address) {
            setEnsAddress(address);
          } else {
            throw Error();
          }
        } else {
          // Are there ENS addresses associated?
          if (provider) {
            const lookup = (await provider.lookupAddress(value)) ?? "";
            setEnsLookup(lookup);
          }

          // Then, check for normal address.
          // The following throws on bad address.
          utils.getAddress(value);
        }

        setIsValid(true);
        onAddressChange(ensAddress || value);
      } catch {
        setIsValid(false);
        setEnsAddress("");
        setEnsLookup("");
        onError();
      } finally {
        onChange(event);
      }
    }, CHANGE_DEBOUNCE_RATE),
    [provider, onChange, onError, isTouched]
  );
  const lastValue = useRef("");

  return (
    <S.Wrapper>
      <S.Input
        hasError={hasError}
        onChange={handleChange}
        type="text"
        size="large"
        addonBefore={<FaEthereum />}
        addonAfter={isValid ? <S.Identicon string={lastValue.current} /> : null}
        {...rest}
      />
      {ensAddress && (
        <Alert
          message={
            <>
              ENS address resolved to <br />
              <Typography.Text code={true}>{ensAddress}</Typography.Text>
            </>
          }
          type="info"
          showIcon
        />
      )}
      {ensLookup && (
        <Alert
          message={
            <>
              Did you know? <br />
              This ethereum address is associated with the ENS domain{" "}
              <Typography.Text strong={true}>{ensLookup}</Typography.Text>
            </>
          }
          type="info"
          showIcon
        />
      )}
      {hasError && (
        <Alert
          message="This is not a valid ethereum address."
          type="error"
          showIcon
        />
      )}
    </S.Wrapper>
  );
}

const S = {
  Wrapper: styled.div`
    margin-bottom: ${(props) => props.theme.spacing.large};
  `,
  Input: styled(({ hasError, ...rest }) => <Input {...rest} />)<{
    hasError?: boolean;
  }>`
    ${(props) =>
      props.hasError
        ? css`
            .ant-input-group-addon,
            .ant-input {
              border: 1px solid #58181c !important;
            }

            svg {
              color: #58181c;
            }
          `
        : ""};
  `,
  Identicon: styled(Identicon)`
    width: 24px !important;
    height: 24px !important;
    border-radius: 50%;
  `,
};
