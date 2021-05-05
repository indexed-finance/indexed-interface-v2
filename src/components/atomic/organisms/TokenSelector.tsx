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
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SelectableToken } from "components/atomic/molecules";
import { Token } from "components/atomic/atoms";
import { useBreakpoints, useTranslator } from "hooks";
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

interface Props {
  max?: number | undefined;
  showBalance?: boolean;
  label?: ReactNode;
  assets: Asset[];
  value?: TokenSelectorValue;
  selectable?: boolean;
  balance?: string;
  error?: string;
  reversed?: boolean;
  onChange?: (value: TokenSelectorValue) => void;
}

export function TokenSelector({
  showBalance = true,
  label = "",
  assets,
  value = {},
  selectable = true,
  reversed = false,
  max,
  error = "",
  onChange,
}: Props) {
  const tx = useTranslator();
  const tokenField = `${label} Token`;
  const amountField = `${label} Amount`;
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
        setAmount(0);
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
      <div onClick={handleWrapperClick} style={{ marginBottom: 8 }}>
        <Space
          direction="horizontal"
          style={{
            justifyContent: "space-between",
            flexDirection: reversed ? "row-reverse" : "row",
            width: "100%",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {showBalance && (
              <>
                {value.token ? (
                  <Typography.Text
                    type="secondary"
                    style={{ textAlign: "left" }}
                  >
                    {parseFloat(relevantBalance) ? (
                      <>
                        Balance: {relevantBalance}{" "}
                        {value.token && parseFloat(relevantBalance) > 0 && (
                          <Button
                            type="text"
                            onClick={handleMaxOut}
                            style={{ fontSize: 12 }}
                          >
                            {tx("MAX")}
                          </Button>
                        )}
                      </>
                    ) : (
                      tx("NO_BALANCE")
                    )}
                  </Typography.Text>
                ) : (
                  "-"
                )}
              </>
            )}
            <InputNumber
              bordered={false}
              ref={input}
              min={0}
              max={max}
              step="0.01"
              value={value.amount ?? amount}
              onFocus={() =>
                setTouched({
                  [amountField]: true,
                })
              }
              onChange={onAmountChange}
              style={{
                width: isMobile ? 120 : 200,
                fontSize: 22,
                border: `1px solid ${error ? "#A61C23" : "transparent"}`,
                flex: reversed ? 1 : 0,
              }}
            />
          </Space>
          <div>
            <div style={{ paddingRight: 15, textAlign: "right" }}>
              <Typography.Text type="secondary">{label}</Typography.Text>
            </div>
            <Button
              type={value.token ? "text" : "primary"}
              onClick={handleOpenTokenSelection}
            >
              <Space style={{ position: "relative", top: -4 }}>
                {value.token ? (
                  <>
                    <Token
                      name={value.token}
                      symbol={value.token}
                      size="small"
                      address={tokenLookup[value.token]?.id ?? ""}
                    />
                    {selectable && value.token}
                  </>
                ) : (
                  <div className="fancy" style={{ fontSize: 12 }}>
                    {tx("SELECT_ONE")}
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
                placeholder={tx("SEARCH_TOKENS")}
                enterButton
              />
            </AutoComplete>
          }
          className="TokenSelectorDrawer"
          placement="right"
          closable={true}
          maskClosable={true}
          visible={selectingToken}
          width={300}
          footer={
            <Button
              type="default"
              onClick={handleCloseTokenSelection}
              style={{ width: "100%" }}
            >
              {tx("CLOSE")}
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
