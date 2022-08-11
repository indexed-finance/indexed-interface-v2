import { AiOutlineCaretDown } from "react-icons/ai";
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
import { BigNumber, convert } from "helpers";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Token } from "components/common";
import { TokenInputDecorator } from "./TokenInputDecorator";
import { selectors } from "features";
import { useBreakpoints, useTokenBalance, useTranslator } from "hooks";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";

export type TokenSelectorValue = {
  amount?: {
    displayed: string;
    exact: BigNumber;
  };
  token?: string;
  error?: string;
};

type Asset = {
  id: string;
  name: string;
  symbol: string;
};

interface Props {
  max?: number | undefined;
  showBalance?: boolean;
  balanceLabel?: string;
  balanceOverride?: { displayed: string; exact: BigNumber };
  label?: ReactNode;
  assets: Asset[];
  value?: TokenSelectorValue;
  selectable?: boolean;
  balance?: { displayed: string; exact: BigNumber };
  error?: string;
  reversed?: boolean;
  autoFocus?: boolean;
  onChange?: (value: TokenSelectorValue) => void;
  isInput?: boolean;
  loading?: boolean;
  small?: boolean;
  inputDisabled?: boolean;
}

const DEFAULT_ENTRY = {
  displayed: "0.00",
  exact: convert.toBigNumber("0"),
};

export function TokenSelector({
  showBalance = true,
  balanceLabel,
  balanceOverride,
  label = "",
  assets,
  value = {},
  selectable = true,
  reversed = false,
  max,
  error = "",
  autoFocus = false,
  onChange,
  isInput,
  small = false,
  inputDisabled,
}: Props) {
  const tx = useTranslator();
  const { setTouched } = useFormikContext<any>();
  const [amount, setAmount] = useState(DEFAULT_ENTRY);
  const [token, setToken] = useState(value?.token ?? "");
  const tokenField = `${label} Token`;
  const amountField = `${label} Amount`;
  const [selectingToken, setSelectingToken] = useState(false);
  const input = useRef<null | HTMLInputElement>(null);
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const selectedToken = useMemo(
    () => tokenLookup[token.toLowerCase()],
    [token, tokenLookup]
  );
  const rawBalance = useTokenBalance(selectedToken?.id ?? "");
  const balance = useMemo(() => {
    if (balanceOverride) {
      return balanceOverride;
    }

    if (rawBalance && selectedToken) {
      return {
        displayed: convert.toBalance(rawBalance, selectedToken?.decimals),
        exact: convert.toBigNumber(rawBalance),
      };
    }

    return {
      displayed: "0.00",
      exact: convert.toBigNumber("0"),
    };
  }, [rawBalance, selectedToken, balanceOverride]);

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
  const haveInsufficientBalance = useMemo(
    () =>
      isInput &&
      balance.exact.isLessThan(convert.toBigNumber(value.amount?.exact ?? "0")),
    [isInput, value.amount, balance]
  );
  const onAmountChange = useCallback(
    (newAmountNumber: number) => {
      if (newAmountNumber == null || amount?.exact?.isLessThan(0)) {
        triggerChange({
          amount: DEFAULT_ENTRY,
        });
        setAmount(DEFAULT_ENTRY);
        setTouched({ [amountField]: true });

        return;
      }

      const nextAmount = {
        displayed: newAmountNumber.toString(),
        exact: convert.toToken(
          newAmountNumber.toString(),
          selectedToken?.decimals
        ),
      };

      // if (!value.hasOwnProperty("amount")) {
      setAmount(nextAmount);
      // }

      let error: string | undefined = undefined;
      if (isInput && nextAmount.exact.isGreaterThan(0)) {
        if (nextAmount.exact.isGreaterThan(balance.exact)) {
          error = "Insufficient balance";
        }
      }

      triggerChange({ amount: nextAmount, error });
    },
    [
      amount,
      triggerChange,
      balance,
      isInput,
      amountField,
      setTouched,
      selectedToken?.decimals,
    ]
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
    const amt = balance;
    setAmount(amt);
    triggerChange({
      amount: amt,
      error: undefined,
    });
  }, [balance, triggerChange, setAmount]);
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
        <Space
          direction="horizontal"
          style={{
            width: "100%",
            justifyContent: "space-between",
            flexDirection: reversed ? "row-reverse" : "row",
            alignItems: "flex-end",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <TokenInputDecorator
              balanceLabel={balanceLabel}
              error={haveInsufficientBalance ? "Insufficient balance" : error}
              showBalance={showBalance}
              balance={balance}
              onClickMax={isInput ? handleMaxOut : undefined}
            />
            <InputNumber
              autoFocus={autoFocus}
              ref={input}
              min={0}
              max={max}
              step="0.01"
              value={parseFloat(value.amount?.displayed || amount.displayed)}
              disabled={onChange === undefined || inputDisabled}
              onFocus={() => setTouched({ [amountField]: true })}
              onChange={onAmountChange}
              style={{
                width: isMobile || small ? 120 : 200,
                fontSize: 22,
                flex: reversed ? 1 : 0,
              }}
              className={error ? "input-with-error" : ""}
            />
          </Space>
          <div>
            <div style={{ paddingRight: 15, textAlign: "right" }}>
              <Typography.Text type="secondary">{label}</Typography.Text>
            </div>
            <Button
              type={value.token ? "text" : "primary"}
              onClick={handleOpenTokenSelection}
              disabled={!selectable}
            >
              <Space style={{ position: "relative", top: -4 }}>
                {value.token ? (
                  <>
                    <Token
                      name=""
                      symbol={value.token}
                      size="small"
                      address={selectedToken?.id ?? ""}
                    />
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
                .filter((a) => a.label)
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
          getContainer={false}
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
                key={asset.symbol}
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

interface SelectableTokenProps {
  asset: Asset;
  onClick(asset: Asset): void;
  key: string;
}

const { Item } = List;

function SelectableToken({ asset, onClick, key }: SelectableTokenProps) {
  return (
    <Item
      onClick={() => onClick(asset)}
      className="SelectableToken"
      style={{ padding: "1rem" }}
      key={key}
    >
      <Item.Meta
        style={{ alignItems: "center" }}
        avatar={
          <Token address={asset.id} symbol={asset.symbol} name={asset.symbol} />
        }
        title={
          <Typography.Title
            level={5}
            type="secondary"
            style={{ marginBottom: 0 }}
          >
            {asset.name}
          </Typography.Title>
        }
      />
    </Item>
  );
}
