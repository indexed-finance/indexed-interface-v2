import { AppState, FormattedIndexPool, selectors } from "features";
import { Area, Button, Token } from "components/atoms";
import { CaretDownOutlined } from "@ant-design/icons";
import { InputNumber, List, Space, Typography } from "antd";
import { SelectableToken } from "components/molecules";
import { useDrawer } from "./providers";
import { useSelector } from "react-redux";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

export type TokenSelectorValue = {
  amount?: number;
  token?: string;
};

export interface Props {
  label?: string;
  pool: FormattedIndexPool;
  value?: TokenSelectorValue;
  selectable?: boolean;
  balance?: string;
  onChange?: (value: TokenSelectorValue) => void;
}

export default function TokenSelector({
  label = "",
  pool,
  value = {},
  selectable = true,
  onChange,
}: Props) {
  const [amount, setAmount] = useState(value?.amount ?? 0);
  const [token, setToken] = useState(value?.token ?? "");
  const balances = useSelector((state: AppState) =>
    selectors.selectTokenSymbolsToBalances(state)
  );
  const relevantBalance = useMemo(() => balances[token], [balances, token]);
  const input = useRef<null | HTMLInputElement>(null);
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const { openDrawer, closeDrawer } = useDrawer({
    name: "Select a token",
    title: "",
    mask: true,
    width: 420,
    actions: [
      {
        type: "default",
        label: "Close",
        onClick: () => closeDrawer(),
      },
    ],
    closable: true,
  });
  const triggerChange = useCallback(
    (changedValue: TokenSelectorValue) => {
      if (onChange) {
        onChange({
          amount,
          token,
          ...value,
          ...changedValue,
        });
      }
    },
    [onChange, amount, token, value]
  );
  const onAmountChange = useCallback(
    (newAmount?: number | string | null) => {
      if (newAmount == null || Number.isNaN(amount) || amount < 0) {
        return;
      }

      const amountToUse =
        typeof newAmount === "string" ? parseFloat(newAmount) : newAmount;

      if (!value.hasOwnProperty("amount")) {
        setAmount(amountToUse);
      }

      triggerChange({ amount: amountToUse });
    },
    [amount, triggerChange, value]
  );
  const onTokenChange = useCallback(
    (newToken: string) => {
      if (!value.hasOwnProperty("token")) {
        setToken(newToken);
      }

      triggerChange({ token: newToken });
      closeDrawer();
    },
    [closeDrawer, triggerChange, value]
  );
  const handleWrapperClick = useCallback(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);
  const handleMaxOut = useCallback(() => {
    onAmountChange(relevantBalance);
  }, [onAmountChange, relevantBalance]);

  // Effect: Sync parent values with local values.
  // --
  useEffect(() => {
    if (value.amount) {
      setAmount(value.amount);
    }

    if (value.token) {
      setToken(value.token);
    }
  }, [value]);

  return (
    <Area>
      <S.Wrapper onClick={handleWrapperClick}>
        <S.Space direction="horizontal">
          <S.Label>
            <Typography.Text type="secondary">{label}</Typography.Text>
          </S.Label>
          <S.Balance>
            {value.token ? (
              <S.BalanceLabel>
                <Typography.Text type="secondary">
                  {parseInt(relevantBalance) ? (
                    <>Balance: {relevantBalance}</>
                  ) : (
                    "No Balance"
                  )}
                </Typography.Text>
              </S.BalanceLabel>
            ) : (
              "-"
            )}
          </S.Balance>
        </S.Space>
        <S.Space direction="horizontal">
          <S.InputNumber
            ref={input}
            min={0}
            step="0.01"
            value={value.amount ?? amount}
            onChange={onAmountChange}
          />
          <S.InnerSpace>
            {value.token && parseFloat(relevantBalance) > 0 && (
              <Button type="dashed" onClick={handleMaxOut}>
                MAX
              </Button>
            )}
            <S.Button
              type={value.token ? "text" : "primary"}
              onClick={() =>
                selectable &&
                openDrawer(
                  <S.List size="small">
                    <S.SelectOne level={3}>Select one</S.SelectOne>
                    {pool.assets.map((asset) => (
                      <SelectableToken
                        key={asset.name}
                        asset={asset}
                        onClick={(selectedAsset) => {
                          onTokenChange(selectedAsset.symbol);
                        }}
                      />
                    ))}
                  </S.List>
                )
              }
            >
              {value.token ? (
                <>
                  <S.Token
                    name={value.token}
                    image={value.token}
                    address={tokenLookup[value.token]?.id ?? ""}
                  />
                  {value.token}
                </>
              ) : (
                "Select"
              )}
              {selectable && <CaretDownOutlined />}
            </S.Button>
          </S.InnerSpace>
        </S.Space>
      </S.Wrapper>
    </Area>
  );
}

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    padding: ${(props) => props.theme.spacing.small};
  `,
  InputNumber: styled(InputNumber)`
    border: none;
    font-size: 24px;
    font-weight: 500;
    min-width: 130px;
    background: ${(props) =>
      props.theme.mode === "dark"
        ? props.theme.colors.black400
        : props.theme.colors.purple300};
  `,
  Space: styled(Space)`
    justify-content: space-between;

    :first-of-type {
      margin-bottom: ${(props) => props.theme.spacing.medium};
    }
  `,
  Button: styled(Button)`
    text-align: right;
    ${(props) => props.theme.snippets.perfectlyCentered};
  `,
  Label: styled.div`
    padding-left: 0.7rem;
    ${(props) => props.theme.snippets.fancy};
  `,
  Balance: styled.div`
    padding-right: 1rem;
    text-align: right;
  `,
  BalanceLabel: styled.div`
    ${(props) => props.theme.snippets.fancy};
  `,
  InnerSpace: styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
  `,
  List: styled(List)`
    .ant-list-item-meta {
      align-items: center;
    }
  `,
  Token: styled(Token)`
    margin-right: ${(props) => props.theme.spacing.small};
  `,
  SelectOne: styled(Typography.Title)`
    ${(props) => props.theme.snippets.fancy};
  `,
};
