import { AppState, FormattedIndexPool, selectors } from "features";
import { Button, InputNumber, List, Space, Typography } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";
import { SelectableToken } from "components/molecules";
import { Token } from "components/atoms";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDrawer } from "./providers";
import { useSelector } from "react-redux";

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
    <div onClick={handleWrapperClick}>
      <Space direction="horizontal">
        <Typography.Text type="secondary">{label}</Typography.Text>
        <div>
          {value.token ? (
            <Typography.Text type="secondary">
              {parseInt(relevantBalance) ? (
                <>Balance: {relevantBalance}</>
              ) : (
                "No Balance"
              )}
            </Typography.Text>
          ) : (
            "-"
          )}
        </div>
      </Space>
      <Space direction="horizontal">
        <InputNumber
          ref={input}
          min={0}
          step="0.01"
          value={value.amount ?? amount}
          onChange={onAmountChange}
        />
        <div>
          {value.token && parseFloat(relevantBalance) > 0 && (
            <Button type="dashed" onClick={handleMaxOut}>
              MAX
            </Button>
          )}
          <Button
            type={value.token ? "text" : "primary"}
            onClick={() =>
              selectable &&
              openDrawer(
                <List size="small">
                  <Typography.Title level={3}>Select one</Typography.Title>
                  {pool.assets.map((asset) => (
                    <SelectableToken
                      key={asset.name}
                      asset={asset}
                      onClick={(selectedAsset) => {
                        onTokenChange(selectedAsset.symbol);
                      }}
                    />
                  ))}
                </List>
              )
            }
          >
            {value.token ? (
              <>
                <Token
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
          </Button>
        </div>
      </Space>
    </div>
  );
}
