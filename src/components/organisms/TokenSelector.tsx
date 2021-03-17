import { AiOutlineCaretDown } from "react-icons/ai";
import { AppState, selectors } from "features";
import {
  AutoComplete,
  Button,
  Drawer,
  Input,
  InputNumber,
  List,
  Space,
  Typography,
} from "antd";
import { SelectableToken } from "components/molecules";
import { Token } from "components/atoms";
import { useBreakpoints } from "helpers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";

export type TokenSelectorValue = {
  amount?: number;
  token?: string;
};

type Asset = {
  name: string;
  symbol: string;
};

export interface Props {
  label?: string;
  assets: Asset[];
  value?: TokenSelectorValue;
  selectable?: boolean;
  balance?: string;
  parent?: false | HTMLElement;
  onChange?: (value: TokenSelectorValue) => void;
}

export default function TokenSelector({
  label = "",
  assets,
  value = {},
  parent = false,
  selectable = true,
  onChange,
}: Props) {
  const tokenField = `${label.toLowerCase()}Token`;
  const amountField = `${label.toLowerCase()}Amount`;
  const { setTouched } = useFormikContext<any>();
  const [amount, setAmount] = useState(value?.amount ?? 0);
  const [token, setToken] = useState(value?.token ?? "");
  const [selectingToken, setSelectingToken] = useState(false);
  const balances = useSelector((state: AppState) =>
    selectors.selectTokenSymbolsToBalances(state)
  );
  const relevantBalance = useMemo(() => balances[token.toLowerCase()], [
    balances,
    token,
  ]);
  const input = useRef<null | HTMLInputElement>(null);
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
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
    },
    [triggerChange, value]
  );
  const handleWrapperClick = useCallback(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);
  const handleMaxOut = useCallback(() => {
    onAmountChange(relevantBalance);
  }, [onAmountChange, relevantBalance]);
  const handleOpenTokenSelection = useCallback(() => {
    if (selectable) {
      setSelectingToken(true);
      setTouched({
        [tokenField]: true,
      });
    }
  }, [selectable, setTouched, tokenField]);
  const handleCloseTokenSelection = useCallback(
    () => setSelectingToken(false),
    []
  );
  const handleSelectToken = useCallback(
    (selectedAsset) => {
      onTokenChange(
        typeof selectedAsset === "object" && selectedAsset.symbol
          ? selectedAsset.symbol
          : selectedAsset
      );
      handleCloseTokenSelection();
    },
    [handleCloseTokenSelection, onTokenChange]
  );
  const { isMobile } = useBreakpoints();

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
    <>
      <div onClick={handleWrapperClick}>
        <Space direction="horizontal" className="spaced-between">
          <Space direction="vertical">
            {value.token ? (
              <Typography.Text type="secondary" style={{ textAlign: "left" }}>
                {parseInt(relevantBalance) ? (
                  <>
                    Balance: {relevantBalance}{" "}
                    {value.token && parseFloat(relevantBalance) > 0 && (
                      <Button
                        type="text"
                        onClick={handleMaxOut}
                        style={{ fontSize: 12 }}
                      >
                        MAX
                      </Button>
                    )}
                  </>
                ) : (
                  "No Balance"
                )}
              </Typography.Text>
            ) : (
              "-"
            )}
            <InputNumber
              ref={input}
              min={0}
              step="0.01"
              value={value.amount ?? amount}
              onFocus={() =>
                setTouched({
                  [amountField]: true,
                })
              }
              onChange={onAmountChange}
              style={{ width: isMobile ? 120 : 200, fontSize: 22 }}
            />
          </Space>
          <div>
            <div style={{ paddingRight: 15, textAlign: "right" }}>
              <Typography.Text type="secondary">{label}</Typography.Text>
            </div>
            {}
            <Button
              type={value.token ? "text" : "primary"}
              onClick={handleOpenTokenSelection}
            >
              <Space>
                {value.token ? (
                  <>
                    <Token
                      name=""
                      image={value.token}
                      size="small"
                      address={tokenLookup[value.token]?.id ?? ""}
                    />
                    {value.token}
                  </>
                ) : (
                  <div className="fancy" style={{ fontSize: 12 }}>
                    Select one
                  </div>
                )}
                {selectable && <AiOutlineCaretDown />}
              </Space>
            </Button>
          </div>
        </Space>
      </div>
      {selectingToken && (
        <Drawer
          title={
            <AutoComplete
              style={{ width: "100%" }}
              options={assets
                .map(({ name: label, symbol: value }) => ({
                  label,
                  value,
                }))
                .sort((a, b) => a.label.localeCompare(b.label))}
              filterOption={(inputValue, option) =>
                option!.value
                  .toUpperCase()
                  .indexOf(inputValue.toUpperCase()) !== -1
              }
              onSelect={handleSelectToken}
            >
              <Input.Search
                name="tokens"
                size="large"
                placeholder="Search tokens"
                enterButton
              />
            </AutoComplete>
          }
          className="TokenSelectorDrawer"
          placement="right"
          closable={false}
          visible={selectingToken}
          width={300}
          footer={
            <Button
              type="default"
              onClick={handleCloseTokenSelection}
              style={{ width: "100%" }}
            >
              Close
            </Button>
          }
        >
          <List>
            {assets.map((asset) => (
              <SelectableToken
                key={asset.name}
                asset={asset}
                onClick={handleSelectToken}
              />
            ))}
          </List>
        </Drawer>
      )}
    </>
  );
}
